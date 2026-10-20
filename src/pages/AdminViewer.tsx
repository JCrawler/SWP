import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Eye, FolderCode, Loader2, AlertCircle, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SwpLogo } from '../components/SwpLogo';
import { buildPreviewDocument, PREVIEW_SANDBOX } from '../lib/previewDocument';

/* ------------------------------------------------------------------ */
/*  Admin: list of ONE student's works (titles and dates only, no code) */
/* ------------------------------------------------------------------ */

interface WorkRow {
  nickname: string;
  owner_id: string;
  portfolio_id: string | null;
  title: string | null;
  updated_at: string | null;
}

interface StudentWorksProps {
  studentId: string;
  onNavigate: (route: string) => void;
  onSignOut: () => Promise<void>;
}

export const AdminStudentWorks: React.FC<StudentWorksProps> = ({
  studentId,
  onNavigate,
  onSignOut,
}) => {
  const [rows, setRows] = useState<WorkRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setError(null);

    (async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('admin_student_works', {
          p_owner: studentId,
        });
        if (cancelled) return;
        if (rpcError) setError(rpcError.message);
        else setRows((data as WorkRow[]) || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load this student.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const nickname = rows && rows.length > 0 ? rows[0].nickname : '';
  const works = (rows || []).filter((r) => r.portfolio_id);

  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e3e0f5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwpLogo size="md" />
            <div>
              <h1 className="text-lg font-bold text-[#1e1b2e] leading-none">SWP Admin</h1>
              <p className="text-xs text-[#6b6580] mt-1">View only: output of student work</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#3e29bd] hover:bg-[#eeeafd] rounded-xl transition-colors border border-[#e3e0f5]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All students</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#6b6580] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-colors border border-[#e3e0f5]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {error ? (
          <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-2xl flex items-center gap-2 text-sm text-[#dc2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : rows === null ? (
          <div className="flex items-center justify-center py-16 text-[#6b6580]">
            <Loader2 className="w-6 h-6 animate-spin text-[#3e29bd]" />
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white border border-[#e3e0f5] rounded-2xl p-10 text-center text-sm text-[#6b6580]">
            Student not found.
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#1e1b2e] tracking-tight">@{nickname}&apos;s work</h2>
            <p className="text-sm text-[#6b6580] mt-1 mb-6">
              You can see how each page looks. Editing and viewing the code are not available here.
            </p>

            {works.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-[#e3e0f5] rounded-3xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center mx-auto mb-3">
                  <FolderCode className="w-7 h-7" />
                </div>
                <p className="text-sm text-[#6b6580]">This student has not created any portfolios yet.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {works.map((w) => (
                  <li
                    key={w.portfolio_id as string}
                    className="bg-white border border-[#e3e0f5] rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1e1b2e] truncate">{w.title || 'Untitled Portfolio'}</p>
                      {w.updated_at && (
                        <p className="text-[11px] text-[#6b6580] mt-0.5">
                          Updated {new Date(w.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/admin/view/${w.portfolio_id}`)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View output</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Admin: ONE page's output on a full screen. No editor, no code.     */
/* ------------------------------------------------------------------ */

interface ViewProps {
  portfolioId: string;
  onNavigate: (route: string) => void;
}

interface PortfolioData {
  portfolio_id: string;
  owner_id: string;
  nickname: string;
  title: string;
  html_code: string;
  css_code: string;
}

export const AdminViewPortfolio: React.FC<ViewProps> = ({ portfolioId, onNavigate }) => {
  const [item, setItem] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setItem(null);
    setError(null);
    setNotFound(false);

    (async () => {
      try {
        const { data, error: rpcError } = await supabase.rpc('admin_get_portfolio', {
          p_id: portfolioId,
        });
        if (cancelled) return;
        if (rpcError) setError(rpcError.message);
        else if (!data || data.length === 0) setNotFound(true);
        else setItem(data[0] as PortfolioData);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Could not load this page.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [portfolioId]);

  const pageDocument = useMemo(
    () => (item ? buildPreviewDocument(item.html_code || '', item.css_code || '') : ''),
    [item]
  );

  const backRoute = item ? `/admin/student/${item.owner_id}` : '/';

  return (
    <div className="h-screen bg-[#f8f7fc] flex flex-col">
      <header className="shrink-0 bg-white border-b border-[#e3e0f5] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigate(backRoute)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#3e29bd] hover:bg-[#eeeafd] rounded-xl transition-colors border border-[#e3e0f5] shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          {item && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1e1b2e] truncate">{item.title || 'Untitled Portfolio'}</p>
              <p className="text-[11px] text-[#6b6580] truncate">by @{item.nickname}</p>
            </div>
          )}
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-[#eeeafd] text-[#3e29bd] border border-[#e3e0f5]">
          <Eye className="w-3.5 h-3.5" />
          View only
        </span>
      </header>

      <main className="flex-1 min-h-0 p-3 sm:p-4">
        {error ? (
          <div className="p-4 bg-[#fef2f2] border border-[#fecaca] rounded-2xl flex items-center gap-2 text-sm text-[#dc2626]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : notFound ? (
          <div className="bg-white border border-[#e3e0f5] rounded-2xl p-10 text-center text-sm text-[#6b6580]">
            This page no longer exists.
          </div>
        ) : !item ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#3e29bd]" />
          </div>
        ) : (
          <div className="h-full bg-white rounded-xl border border-[#e3e0f5] overflow-hidden shadow-sm">
            <iframe
              title={item.title || 'Student page'}
              srcDoc={pageDocument}
              sandbox={PREVIEW_SANDBOX}
              className="w-full h-full border-0 bg-white"
            />
          </div>
        )}
      </main>
    </div>
  );
};