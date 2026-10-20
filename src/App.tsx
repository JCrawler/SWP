import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { Home } from './pages/Home';
import { PortfolioEditor } from './pages/PortfolioEditor';
import { AdminStudentWorks, AdminViewPortfolio } from './pages/AdminViewer';
import { Loader2 } from 'lucide-react';
import { isRealSupabase, supabase } from './supabaseClient';

type Role = 'admin' | 'student';

export default function App() {
  const { user, loading, signOut, refreshProfile } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Who is this person? The DATABASE decides (never the nickname).
  // null = still checking.
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRole(null);
      return;
    }
    setRole(null);

    (async () => {
      let found: Role = 'student';
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if ((data as any)?.role === 'admin') found = 'admin';
      } catch {
        // If we cannot tell, treat the person as a normal student.
      }
      if (!cancelled) setRole(found);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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

  // Which page is being asked for?
  const adminStudentMatch = currentPath.match(/^\/admin\/student\/([^/]+)\/?$/);
  const adminViewMatch = currentPath.match(/^\/admin\/view\/([^/]+)\/?$/);
  const portfolioMatch = currentPath.match(/^\/portfolio\/(.+)$/);
  const isAdminRoute = Boolean(adminStudentMatch || adminViewMatch);

  // Who is allowed where:
  //  - logged-out visitors: only the login screen
  //  - students: their own portfolio folder and editor
  //  - admin: the dashboard and the view-only pages (never the editor)
  let redirectTo: string | null = null;
  if (!loading) {
    if (!user && (isAdminRoute || portfolioMatch)) {
      redirectTo = '/';
    } else if (user && role !== null) {
      if (isAdminRoute && role !== 'admin') redirectTo = '/';
      if (portfolioMatch && role === 'admin') redirectTo = '/';
    }
  }

  useEffect(() => {
    if (redirectTo) navigate(redirectTo);
  }, [redirectTo, navigate]);

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

  // Checking the session, or checking the role
  if (loading || (user && role === null)) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-[#3e29bd]" />
          <p className="text-sm font-semibold text-[#6b6580]">SWP...</p>
        </div>
      </div>
    );
  }

  if (redirectTo) return null;

  // Admin: one student's works (titles only)
  if (adminStudentMatch) {
    return (
      <AdminStudentWorks
        studentId={decodeURIComponent(adminStudentMatch[1])}
        onNavigate={navigate}
        onSignOut={signOut}
      />
    );
  }

  // Admin: one page's output (view only, no code)
  if (adminViewMatch) {
    return (
      <AdminViewPortfolio
        portfolioId={decodeURIComponent(adminViewMatch[1])}
        onNavigate={navigate}
      />
    );
  }

  // Student editor (/portfolio/new or /portfolio/:id)
  if (portfolioMatch && user) {
    return (
      <PortfolioEditor
        portfolioId={portfolioMatch[1]}
        user={user}
        onNavigate={navigate}
      />
    );
  }

  // Default: Home ("/") - login screen, student folder, or admin dashboard
  return (
    <Home
      user={user}
      onSignOut={signOut}
      onNavigate={navigate}
      onAuthSuccess={refreshProfile}
    />
  );
}