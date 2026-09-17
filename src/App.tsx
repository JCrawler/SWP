import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { PortfolioEditor } from './pages/PortfolioEditor';
import { Loader2 } from 'lucide-react';

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
