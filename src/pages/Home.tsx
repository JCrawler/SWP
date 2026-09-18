import React, { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_SCHEMA_SQL } from '../supabaseClient';
import { Profile, Portfolio } from '../types';
import { SearchBar } from '../components/SearchBar';
import { NicknameCard } from '../components/NicknameCard';
import { CreatePortfolioTile } from '../components/CreatePortfolioTile';
import { PortfolioCard } from '../components/PortfolioCard';
import { SwpLogo } from '../components/SwpLogo';
import {
  LogOut,
  Plus,
  Database,
  Check,
  Copy,
  FolderCode,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface HomeProps {
  user: { id: string; email: string; nickname: string } | null;
  onSignOut: () => Promise<void>;
  onNavigate: (route: string) => void;
  onAuthSuccess: () => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  onSignOut,
  onNavigate,
  onAuthSuccess,
}) => {
  // Logged-out state data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNickname, setExpandedNickname] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profilesError, setProfilesError] = useState<string | null>(null);

  // Logged-in state data
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [portfoliosError, setPortfoliosError] = useState<string | null>(null);

  // Global inline notifications (Success/Error feedback)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // SQL Schema Modal State
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Fetch registered student profiles (logged-out directory)
  const fetchProfiles = useCallback(async () => {
    setLoadingProfiles(true);
    setProfilesError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        setProfilesError(`Error loading student directory: ${error.message}`);
      } else if (data) {
        setProfiles(data);
      }
    } catch (err: any) {
      setProfilesError(err?.message || 'Failed to connect to directory.');
    } finally {
      setLoadingProfiles(false);
    }
  }, []);

  // Fetch authenticated student's own portfolios
  const fetchMyPortfolios = useCallback(async () => {
    if (!user) return;
    setLoadingPortfolios(true);
    setPortfoliosError(null);
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        setPortfoliosError(`Failed to load your portfolios: ${error.message}`);
      } else if (data) {
        setPortfolios(data);
      }
    } catch (err: any) {
      setPortfoliosError(err?.message || 'Error querying portfolios from database.');
    } finally {
      setLoadingPortfolios(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      fetchProfiles();
    } else {
      fetchMyPortfolios();
    }
  }, [user, fetchProfiles, fetchMyPortfolios]);

  // Handle portfolio deletion
  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (!error) {
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
        setFeedback({
          type: 'success',
          message: 'Portfolio deleted successfully.',
        });
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({
          type: 'error',
          message: `Failed to delete portfolio: ${error.message}`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to delete portfolio due to network issue.',
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Filter profiles by nickname
  const filteredProfiles = profiles.filter(p =>
  p.nickname.toLowerCase().includes(searchQuery.toLowerCase().trim())
);

  /* ------------------------------------------------------------- */
  /*                      LOGGED IN STATE                          */
  /* ------------------------------------------------------------- */
  if (user) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e3e0f5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SwpLogo size="md" />
              <div>
                <h1 className="text-lg font-bold text-[#1e1b2e] leading-none">
                  SWP
                </h1>
                <p className="text-xs text-[#6b6580] mt-0.5 font-medium">
                  Student Webpage Project Viewer
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-[#6b6580]">
                    Welcome, <strong className="text-[#3e29bd] font-semibold">{user.nickname}</strong>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#6b6580]"></span>
                  <span className="text-[11px] text-[#16a34a] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Private Session Active
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="create-new-portfolio-nav-btn"
                type="button"
                onClick={() => onNavigate('/portfolio/new')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ New Portfolio</span>
              </button>

              <button
                id="logout-btn"
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-sm font-medium text-[#6b6580] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-colors border border-[#e3e0f5]"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`border-b px-4 py-2.5 text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
                : feedback.type === 'error'
                ? 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'
                : 'bg-[#eeeafd] border-[#e3e0f5] text-[#3e29bd]'
            }`}
          >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16a34a]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
                )}
                <span className="font-semibold">{feedback.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 hover:opacity-75"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Portfolios Fetch Error */}
        {portfoliosError && (
          <div className="bg-[#fef2f2] border-b border-[#fecaca] px-4 py-3 text-xs text-[#dc2626]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{portfoliosError}</span>
              </div>
              <button
                type="button"
                onClick={fetchMyPortfolios}
                className="font-bold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Logged-in Content Dashboard */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e1b2e] tracking-tight">
                My Portfolios
              </h2>
              <p className="text-sm text-[#6b6580] mt-1">
                Only you can view and edit these projects while logged in as <strong className="text-[#1e1b2e]">@{user.nickname}</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchMyPortfolios}
              className="inline-flex items-center gap-1.5 text-xs text-[#6b6580] hover:text-[#3e29bd] self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPortfolios ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingPortfolios ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-[#e3e0f5] rounded-2xl h-64 animate-pulse p-4 flex flex-col justify-between">
                  <div className="h-40 bg-[#f0effb] rounded-xl w-full" />
                  <div className="h-4 bg-[#f0effb] rounded w-2/3 mt-3" />
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            /* Logged-in Empty State */
            <div className="bg-white border-2 border-dashed border-[#e3e0f5] rounded-3xl p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center mx-auto mb-4">
                <FolderCode className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1e1b2e] mb-2">
                No portfolios yet
              </h3>
              <p className="text-sm text-[#6b6580] mb-6 max-w-md mx-auto">
                No portfolios yet — click <strong className="text-[#1e1b2e]">+ New Portfolio</strong> to add your first HTML/CSS project.
              </p>
              <button
                id="empty-state-new-portfolio-btn"
                type="button"
                onClick={() => onNavigate('/portfolio/new')}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ New Portfolio</span>
              </button>
            </div>
          ) : (
            /* Portfolios Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* + New Portfolio Tile */}
              <div
                id="add-portfolio-grid-tile"
                onClick={() => onNavigate('/portfolio/new')}
                className="bg-[#eeeafd]/40 border-2 border-dashed border-[#3e29bd]/40 hover:border-[#3e29bd] hover:bg-[#eeeafd]/70 rounded-2xl p-6 min-h-[260px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#3e29bd] text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-bold text-[#1e1b2e] text-sm group-hover:text-[#3e29bd] transition-colors">
                  + New Portfolio
                </h4>
                <p className="text-xs text-[#6b6580] mt-1 max-w-[180px]">
                  Write or paste new HTML &amp; CSS code
                </p>
              </div>

              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onEdit={(id) => onNavigate(`/portfolio/${id}`)}
                  onDelete={handleDeletePortfolio}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /*                     LOGGED OUT STATE                          */
  /* ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e3e0f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SwpLogo size="lg" />
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1e1b2e] tracking-tight">
                  SWP
                </h1>
                <p className="text-xs sm:text-sm text-[#6b6580] mt-0.5 font-medium">
                  Student Webpage Project Viewer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#6b6580] hover:text-[#3e29bd] bg-[#f8f7fc] hover:bg-[#eeeafd] border border-[#e3e0f5] rounded-xl transition-colors"
                title="View Supabase Schema & SQL"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Schema</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Directory Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-md">
            <SearchBar value={searchQuery} 
              onChange={setSearchQuery} 
              count={filteredProfiles.length} 
              totalCount={profiles.length} />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-xs font-medium text-[#6b6580] bg-white px-3 py-1.5 rounded-xl border border-[#e3e0f5] shadow-xs">
              {profiles.length} registered {profiles.length === 1 ? 'student' : 'students'}
            </span>
            <button
              type="button"
              onClick={fetchProfiles}
              className="p-2 text-[#6b6580] hover:text-[#3e29bd] hover:bg-white rounded-xl transition-colors"
              title="Refresh students"
            >
              <RefreshCw className={`w-4 h-4 ${loadingProfiles ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Inline error for directory loading */}
        {profilesError && (
          <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-2xl flex items-center justify-between text-xs text-[#dc2626]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profilesError}</span>
            </div>
            <button
              type="button"
              onClick={fetchProfiles}
              className="font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Nicknames Grid */}
        {/* 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Always visible + Create your portfolio tile at start of grid */}
          <CreatePortfolioTile
            onSuccess={onAuthSuccess}
            onSelectExistingNickname={(nick) => {
              setSearchQuery(nick);
              setExpandedNickname(nick);
              setFeedback({
                type: 'info',
                message: `Nickname @${nick} already exists. Enter password to unlock.`,
              });
            }}
          />

          {loadingProfiles ? (
            /* Skeletons */
            [1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div
                key={n}
                className="bg-white border border-[#e3e0f5] rounded-2xl p-5 h-32 animate-pulse flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f0effb]" />
                  <div className="h-4 bg-[#f0effb] rounded w-24" />
                </div>
                <div className="h-3 bg-[#f0effb] rounded w-16" />
              </div>
            ))
          ) : filteredProfiles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-[#6b6580] bg-white rounded-2xl border border-[#e3e0f5] p-8">
              <p className="font-semibold text-sm text-[#1e1b2e] mb-1">
                No student nicknames match "{searchQuery}"
              </p>
              <p>Try searching for another nickname, or create your portfolio above.</p>
            </div>
          ) : (
            filteredProfiles.map((p) => (
              <NicknameCard
                key={p.id}
                nickname={p.nickname}
                isExpanded={expandedNickname === p.nickname}
                onToggleExpand={() =>
                  setExpandedNickname(expandedNickname === p.nickname ? null : p.nickname)
                }
                onSuccess={onAuthSuccess}
              />
            ))
          )}
        </div>
      </main>

      {/* Supabase Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e3e0f5] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
            <div className="px-6 py-5 border-b border-[#e3e0f5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e1b2e] text-base">
                    Supabase PostgreSQL Schema &amp; RLS Policies
                  </h3>
                  <p className="text-xs text-[#6b6580]">
                    Run this once in your Supabase SQL Editor to configure tables &amp; auth
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-[#6b6580] hover:text-[#1e1b2e] p-1 rounded-lg"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-[#1e1b2e] text-slate-100 font-mono text-xs leading-relaxed">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>

            <div className="px-6 py-4 bg-[#f8f7fc] border-t border-[#e3e0f5] flex items-center justify-between">
              <span className="text-xs text-[#6b6580]">
                Profiles are public; portfolios require <code>auth.uid() = owner_id</code>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy SQL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6b6580] hover:text-[#1e1b2e] hover:bg-white rounded-xl border border-transparent hover:border-[#e3e0f5] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
