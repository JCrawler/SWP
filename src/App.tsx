import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { PortfolioEditor } from './pages/PortfolioEditor';
import { AdminDashboard } from './pages/AdminDashboard';
import { Loader2, LogOut, SwatchBook } from 'lucide-react';
import { isRealSupabase, supabase } from './supabaseClient';
import { SwpLogo } from './components/SwpLogo';

export default function App() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Track if user has admin privileges
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      if (user.nickname.toLowerCase() === 'admin') {
        setIsAdmin(true);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        setIsAdmin((data as any)?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminRole();
  }, [user]);

  // Keep state in sync with browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((route: string) => {
    if (window.location.pathname !== route) {
      window.history.pushState({}, '', route);
    }
    setCurrentPath(route);
  }, []);

  // In production, never silently use the fake in-browser database
  if (import.meta.env.PROD && !isRealSupabase) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center p-4">
        <div className="bg-white border border-[#fecaca] rounded-2xl p-8 max-w-md text-center shadow-sm">
          <h1 className="text-lg font-bold text-[#1e1b2e] mb-2">Database not connected</h1>
          <p className="text-sm text-[#6b6580]">
            This site was built without its Supabase settings, so it cannot save anything.
            Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  // If loading session initially
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-[#3e29bd]" />
          <p className="text-sm font-semibold text-[#6b6580]">SWP...</p>
        </div>
      </div>
    );
  }

  // Handle Admin Dashboard Route (/admin)
  if (currentPath === '/admin') {
    if (!user || !isAdmin) {
      // If not logged in as admin, redirect to root login screen
      navigate('/');
      return null;
    }

    return (
      <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
        <header className="bg-white border-b border-[#e3e0f5] px-6 py-3.5 flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-3">
            <SwpLogo size="sm" />
            <span className="font-bold text-sm text-[#1e1b2e]">SWP Teacher Administration</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-[#3e29bd] hover:underline"
            >
              ← Back to Folders
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 text-xs text-[#dc2626] bg-[#fef2f2] px-3 py-1.5 rounded-xl border border-[#fecaca] font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>
        <div className="flex-1">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  // Parse path for editor route (e.g. /portfolio/new or /portfolio/:id)
  const portfolioMatch = currentPath.match(/^\/portfolio\/(.+)$/);
  const isEditorRoute = Boolean(portfolioMatch);
  const portfolioId = portfolioMatch ? portfolioMatch[1] : null;

  // Protect editor route: if not logged in, force to Home "/"
  if (isEditorRoute) {
    if (!user) {
      navigate('/');
      return (
        <Home
          user={null}
          onSignOut={signOut}
          onNavigate={navigate}
          onAuthSuccess={refreshProfile}
        />
      );
    }

    return (
      <PortfolioEditor
        portfolioId={portfolioId}
        user={user}
        onNavigate={navigate}
      />
    );
  }

  // Default: Home ("/") — Handles Login, Password Reset, and Student Folder views
  return (
    <Home
      user={user}
      onSignOut={signOut}
      onNavigate={navigate}
      onAuthSuccess={refreshProfile}
    />
  );
}