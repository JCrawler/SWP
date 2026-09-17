import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { CodeEditorPane } from '../components/CodeEditorPane';
import { LivePreview } from '../components/LivePreview';
import { OutputCodeToggle } from '../components/OutputCodeToggle';
import { SwpLogo } from '../components/SwpLogo';
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

interface PortfolioEditorProps {
  portfolioId: string | null; // 'new' or UUID
  user: { id: string; email: string; nickname: string } | null;
  onNavigate: (route: string) => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  portfolioId: initialPortfolioId,
  user,
  onNavigate,
}) => {
  const [currentPortfolioId, setCurrentPortfolioId] = useState<string | null>(initialPortfolioId);
  const isNew = !currentPortfolioId || currentPortfolioId === 'new';

  const [title, setTitle] = useState(isNew ? 'webpage project' : '');
  const [htmlCode, setHtmlCode] = useState(isNew ? '' : '');
  const [cssCode, setCssCode] = useState(isNew ? '' : '');

  // Snapshot of last saved state to detect unsaved changes
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<{
    title: string;
    htmlCode: string;
    cssCode: string;
  }>({
    title: isNew ? 'webpage project' : '',
    htmlCode: '',
    cssCode: '',
  });

  // Debounced code for live preview (~300ms)
  const [debouncedHtml, setDebouncedHtml] = useState(htmlCode);
  const [debouncedCss, setDebouncedCss] = useState(cssCode);

  // View toggle for screens below lg breakpoint
  const [activeTab, setActiveTab] = useState<'output' | 'code'>('code');

  // Async states & feedback
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check if current editor content differs from saved snapshot
  const hasUnsavedChanges = useMemo(() => {
    return (
      title !== lastSavedSnapshot.title ||
      htmlCode !== lastSavedSnapshot.htmlCode ||
      cssCode !== lastSavedSnapshot.cssCode
    );
  }, [title, htmlCode, cssCode, lastSavedSnapshot]);

  // Debounce live preview updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
      setDebouncedCss(cssCode);
    }, 300);

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode]);

  // Load existing portfolio from Supabase if editing
  const loadPortfolio = useCallback(async (id: string) => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    setErrorNotice(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        setLoadError(
          fetchError.message || 'Unable to load this portfolio from the database.'
        );
        return;
      }

      if (!data) {
        setLoadError('Portfolio not found. It may have been removed.');
        return;
      }

      const loadedTitle = data.title || 'Untitled Portfolio';
      const loadedHtml = data.html_code ?? '';
      const loadedCss = data.css_code ?? '';

      setTitle(loadedTitle);
      setHtmlCode(loadedHtml);
      setCssCode(loadedCss);
      setDebouncedHtml(loadedHtml);
      setDebouncedCss(loadedCss);

      setLastSavedSnapshot({
        title: loadedTitle,
        htmlCode: loadedHtml,
        cssCode: loadedCss,
      });
    } catch (err: any) {
      setLoadError(err?.message || 'Unexpected network error loading portfolio.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      onNavigate('/');
      return;
    }

    if (currentPortfolioId && currentPortfolioId !== 'new') {
      loadPortfolio(currentPortfolioId);
    } else {
      setLoading(false);
    }
  }, [currentPortfolioId, user, onNavigate, loadPortfolio]);

  // Handle Save
  const handleSave = async () => {
    if (!user) {
      setErrorNotice('You must be logged in to save portfolios.');
      return;
    }

    setSaving(true);
    setErrorNotice(null);
    setSaveSuccessNotice(null);

    const portfolioTitle = title.trim() || 'webpage project';

    try {
      if (isNew) {
        // Create new portfolio
        const { data, error: insertError } = await supabase
          .from('portfolios')
          .insert([
            {
              owner_id: user.id,
              title: portfolioTitle,
              html_code: htmlCode,
              css_code: cssCode,
            },
          ])
          .select()
          .single();

        if (insertError) {
          setErrorNotice(`Save failed: ${insertError.message}`);
          setSaving(false);
          return;
        }

        const newId = data?.id;
        if (newId) {
          setCurrentPortfolioId(newId);
          window.history.replaceState({}, '', `/portfolio/${newId}`);
        }

        setLastSavedSnapshot({
          title: portfolioTitle,
          htmlCode,
          cssCode,
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSaveSuccessNotice(`Portfolio created and saved successfully at ${timeStr}!`);
        setTimeout(() => setSaveSuccessNotice(null), 5000);
      } else {
        // Update existing portfolio
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            title: portfolioTitle,
            html_code: htmlCode,
            css_code: cssCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentPortfolioId);

        if (updateError) {
          setErrorNotice(`Update failed: ${updateError.message}`);
          setSaving(false);
          return;
        }

        setLastSavedSnapshot({
          title: portfolioTitle,
          htmlCode,
          cssCode,
        });

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setSaveSuccessNotice(`All changes saved to Supabase at ${timeStr}.`);
        setTimeout(() => setSaveSuccessNotice(null), 4000);
      }
    } catch (err: any) {
      setErrorNotice(err?.message || 'An error occurred while saving your portfolio.');
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Handle Delete
  const handleDelete = async () => {
    if (!currentPortfolioId || isNew) return;
    setDeleting(true);
    setErrorNotice(null);

    try {
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', currentPortfolioId);

      if (deleteError) {
        setErrorNotice(`Failed to delete: ${deleteError.message}`);
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }

      onNavigate('/');
    } catch (err: any) {
      setErrorNotice(err?.message || 'Delete failed due to network error.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!user) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center p-4">
        <div className="bg-white border border-[#e3e0f5] rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h2 className="text-base font-bold text-[#1e1b2e] mb-1">Loading Portfolio</h2>
          <p className="text-xs text-[#6b6580]">
            Fetching HTML and CSS code from Supabase backend...
          </p>
        </div>
      </div>
    );
  }

  // Load failure state with recovery actions
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center p-4">
        <div className="bg-white border border-[#fecaca] rounded-2xl p-8 max-w-md w-full shadow-md text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] text-[#dc2626] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1e1b2e] mb-2">Unable to Load Portfolio</h2>
          <p className="text-xs text-[#dc2626] bg-[#fef2f2] p-3 rounded-xl mb-4 font-mono leading-relaxed border border-[#fecaca]">
            {loadError}
          </p>
          <p className="text-xs text-[#6b6580] mb-6">
            Make sure this portfolio belongs to @{user.nickname} and your connection is active.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 text-xs font-semibold text-[#6b6580] hover:text-[#1e1b2e] hover:bg-[#f8f7fc] rounded-xl border border-[#e3e0f5] transition-colors"
            >
              Back to Gallery
            </button>
            {currentPortfolioId && (
              <button
                type="button"
                onClick={() => loadPortfolio(currentPortfolioId)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#3e29bd] hover:bg-[#331f9e] rounded-xl transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8f7fc] overflow-hidden">
      {/* Top Navigation & Action Bar */}
      <header className="h-16 bg-white border-b border-[#e3e0f5] px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            id="back-to-gallery-btn"
            type="button"
            onClick={() => onNavigate('/')}
            className="p-2 text-[#6b6580] hover:text-[#1e1b2e] hover:bg-[#eeeafd] rounded-xl transition-colors shrink-0"
            title="Back to gallery"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <SwpLogo size="sm" />
            <div className="hidden lg:flex flex-col">
              <span className="text-xs font-bold text-[#1e1b2e] leading-none">SWP</span>
              <span className="text-[9px] text-[#6b6580] leading-none mt-0.5">Student Webpage Project Viewer</span>
            </div>
          </div>

          {/* Portfolio Title Input */}
          <div className="flex items-center gap-2 flex-1 max-w-sm sm:max-w-md">
            <input
              id="portfolio-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="webpage project"
              className="w-full px-2.5 py-1.5 font-bold text-sm sm:text-base text-[#1e1b2e] bg-transparent hover:bg-[#f8f7fc] focus:bg-white border border-transparent hover:border-[#e3e0f5] focus:border-[#3e29bd] rounded-xl transition-all outline-none"
            />
          </div>

          {/* Unsaved Changes Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border">
            {saving ? (
              <span className="flex items-center gap-1.5 text-[#3e29bd] border-[#eeeafd] bg-[#eeeafd]/50">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving to Supabase...</span>
              </span>
            ) : hasUnsavedChanges ? (
              <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#16a34a] bg-[#f0fdf4] border-[#bbf7d0]">
                <Check className="w-3 h-3" />
                <span>All changes saved</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons & Responsive Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden">
            <OutputCodeToggle activeView={activeTab} onChange={setActiveTab} />
          </div>

          {/* Delete Button (existing only) */}
          {!isNew && (
            confirmDelete ? (
              <div className="flex items-center gap-1 bg-[#fef2f2] p-1 rounded-xl border border-[#fecaca] animate-fadeIn">
                <button
                  id="confirm-delete-editor-btn"
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#dc2626] text-white rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-[#6b6580] hover:text-[#1e1b2e]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                id="delete-editor-btn"
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 text-[#6b6580] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-colors"
                title="Delete Portfolio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}

          {/* Save Button */}
          <button
            id="save-portfolio-btn"
            type="button"
            disabled={saving}
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 ${
              hasUnsavedChanges
                ? 'bg-[#3e29bd] hover:bg-[#331f9e] text-white ring-2 ring-[#3e29bd]/20'
                : 'bg-[#3e29bd] hover:bg-[#331f9e] text-white'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden xs:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isNew ? 'Save' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Prominent Inline Success Notice */}
      {saveSuccessNotice && (
        <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-4 py-2.5 text-xs text-[#15803d] flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16a34a]" />
            <span className="font-semibold">{saveSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccessNotice(null)}
            className="text-[#15803d] hover:text-[#166534] p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Prominent Inline Error Banner */}
      {errorNotice && (
        <div className="bg-[#fef2f2] border-b border-[#fecaca] px-4 py-2.5 text-xs text-[#dc2626] flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#dc2626]" />
            <span className="font-medium">{errorNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="font-bold underline hover:no-underline text-xs"
            >
              Retry Save
            </button>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-[#dc2626] hover:text-[#991b1b] p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      {/* On desktop (lg breakpoint+): Output and Code side by side */}
      {/* Below that: stacked with visible tab switcher */}
      <main className="flex-1 overflow-hidden p-2.5 sm:p-4">
        {/* Desktop View (lg+): Side by Side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 h-full">
          {/* Code Editors Pane */}
          <div className="h-full overflow-hidden flex flex-col">
            <CodeEditorPane
              htmlCode={htmlCode}
              cssCode={cssCode}
              onHtmlChange={setHtmlCode}
              onCssChange={setCssCode}
            />
          </div>

          {/* Live Preview Pane */}
          <div className="h-full overflow-hidden flex flex-col">
            <LivePreview
              htmlCode={debouncedHtml}
              cssCode={debouncedCss}
              title={title}
              isThumbnail={false}
            />
          </div>
        </div>

        {/* Mobile / Tablet View (<lg): Tab Switched */}
        <div className="lg:hidden h-full">
          {activeTab === 'code' ? (
            <div className="h-full overflow-hidden flex flex-col">
              <CodeEditorPane
                htmlCode={htmlCode}
                cssCode={cssCode}
                onHtmlChange={setHtmlCode}
                onCssChange={setCssCode}
              />
            </div>
          ) : (
            <div className="h-full overflow-hidden flex flex-col">
              <LivePreview
                htmlCode={debouncedHtml}
                cssCode={debouncedCss}
                title={title}
                isThumbnail={false}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
