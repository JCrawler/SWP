import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { PortfolioEditor } from './pages/PortfolioEditor';
import { Loader2 } from 'lucide-react';
import { isRealSupabase } from './supabaseClient';

export default function App() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

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
        <div className="bg-white border border-[#fecaca] rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-lg font-bold text-[#1e1b2e] mb-2">Database not connected</h1>
          <p className="text-sm text-[#6b6580]">
            This site was built without its Supabase settings, so it cannot save anything.
            Please tell the site owner.
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

  // Parse path for editor route
  // e.g. /portfolio/new or /portfolio/:id
  const portfolioMatch = currentPath.match(/^\/portfolio\/(.+)$/);
  const isEditorRoute = Boolean(portfolioMatch);
  const portfolioId = portfolioMatch ? portfolioMatch[1] : null;

  // Protect editor route: if not logged in, force to Home "/"
  if (isEditorRoute) {
    if (!user) {
      // Redirect to home
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

  // Default: Home ("/")
  return (
    <Home
      user={user}
      onSignOut={signOut}
      onNavigate={navigate}
      onAuthSuccess={refreshProfile}
    />
  );
}
