import React, { useState, useEffect, useCallback } from 'react';
import { Footer } from '../components/Footer';
import { supabase } from '../supabaseClient';
import { Profile, Portfolio } from '../types';
import { SearchBar } from '../components/SearchBar';
import { PortfolioCard } from '../components/PortfolioCard';
import { SwpLogo } from '../components/SwpLogo';
import {
  LogOut,
  Plus,
  FolderCode,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  UserPlus,
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
  // Login form state (Logged-out onboarding)
  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Role & Forced Password Reset state
  const [isAdmin, setIsAdmin] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Admin: View Student Portfolios state
  const [viewingStudent, setViewingStudent] = useState<Profile | null>(null);
  const [studentPortfolios, setStudentPortfolios] = useState<Portfolio[]>([]);
  const [loadingStudentPortfolios, setLoadingStudentPortfolios] = useState(false);

  // Admin Dashboard state
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  // Admin: Create new student state
  const [newStudentNick, setNewStudentNick] = useState('');
  const [newStudentPass, setNewStudentPass] = useState('');
  const [creatingStudent, setCreatingStudent] = useState(false);

  // Logged-in Student Portfolio Folder state
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [portfoliosError, setPortfoliosError] = useState<string | null>(null);

  // Global inline notifications
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Check user role and password reset requirement when user logs in
  const checkUserStatus = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setMustChangePassword(false);
      return;
    }

    const localTempFlag = localStorage.getItem(`swp_temp_reset_${user.nickname.toLowerCase()}`);

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const adminStatus = Boolean(data && (data as any).role === 'admin');

      setIsAdmin(adminStatus);

      if ((data && (data as any).must_change_password) || localTempFlag === 'true') {
        setMustChangePassword(true);
      } else {
        setMustChangePassword(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, [user]);

  // Fetch all student profiles (For Admin Dashboard only)
  const fetchProfilesForAdmin = useCallback(async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, created_at')
        .order('nickname', { ascending: true });

      if (error) {
        setFeedback({ type: 'error', message: `Error loading students: ${error.message}` });
      } else if (data) {
        setProfiles(data.filter((p) => p.nickname.toLowerCase() !== 'admin'));
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load students.' });
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
    if (user) {
      checkUserStatus();
    }
  }, [user, checkUserStatus]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProfilesForAdmin();
    } else if (user && !isAdmin && !mustChangePassword) {
      fetchMyPortfolios();
    }
  }, [user, isAdmin, mustChangePassword, fetchProfilesForAdmin, fetchMyPortfolios]);

  // Handle Login Onboarding
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanNick = loginNickname.trim().toLowerCase();
    if (!cleanNick || !loginPassword) {
      setAuthError('Please enter both your username and password.');
      return;
    }

    setAuthLoading(true);
    try {
      const email = cleanNick === 'admin' ? 'admin@swp.local' : `${cleanNick}@swp.local`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      if (error) {
        setAuthError('Invalid username or password. Please try again.');
        return;
      }

      setLoginNickname('');
      setLoginPassword('');
      onAuthSuccess();
    } catch (err: any) {
      setAuthError(err?.message || 'Sign in failed. Please check your connection.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Student Changing Temporary Password
  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setFeedback({ type: 'error', message: error.message });
        return;
      }

      await supabase
        .from('profiles')
        .update({ must_change_password: false } as any)
        .eq('id', user.id);

      localStorage.removeItem(`swp_temp_reset_${user.nickname.toLowerCase()}`);

      setMustChangePassword(false);
      setNewPassword('');
      setConfirmNewPassword('');
      setFeedback({
        type: 'success',
        message: 'Password updated! Welcome to your portfolio folder.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Admin: Generate Temporary Password for a Student
  const handleGenerateTempPassword = async (student: Profile) => {
    setResettingId(student.id);
    const randomChars = Math.random().toString(36).slice(-6);
    const generatedTemp = `Temp_${randomChars}!`;

    try {
      const { error: rpcError } = await supabase.rpc('admin_reset_student_password', {
        target_user_id: student.id,
        new_temp_password: generatedTemp,
      });

      await supabase
        .from('profiles')
        .update({ must_change_password: true } as any)
        .eq('id', student.id);

      localStorage.setItem(`swp_temp_reset_${student.nickname.toLowerCase()}`, 'true');

      setTempPasswords((prev) => ({
        ...prev,
        [student.id]: generatedTemp,
      }));

      if (rpcError) {
        setFeedback({
          type: 'info',
          message: `Temporary password generated for @${student.nickname}.`,
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Temporary password generated for @${student.nickname}.`,
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to reset password.',
      });
    } finally {
      setResettingId(null);
    }
  };

  // Admin: Create New Student Account
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = newStudentNick.trim().toLowerCase();
    if (cleanNick.length < 3 || newStudentPass.length < 6) {
      setFeedback({
        type: 'error',
        message: 'Nickname must be at least 3 chars and temporary password at least 6 chars.',
      });
      return;
    }

    setCreatingStudent(true);
    try {
      const { error } = await supabase.rpc('admin_create_student', {
        student_nickname: cleanNick,
        temp_password: newStudentPass,
      });

      if (error) {
        setFeedback({
          type: 'error',
          message: `Could not create student: ${error.message}`,
        });
      } else {
        localStorage.setItem(`swp_temp_reset_${cleanNick}`, 'true');
        setTempPasswords((prev) => ({ ...prev, [cleanNick]: newStudentPass }));
        setNewStudentNick('');
        setNewStudentPass('');
        setFeedback({
          type: 'success',
          message: `Student @${cleanNick} created with temporary password!`,
        });
        fetchProfilesForAdmin();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error creating student.' });
    } finally {
      setCreatingStudent(false);
    }
  };

  // Admin: Fetch a specific student's portfolios
       const handleViewStudentPortfolios = (student: Profile) => {
       onNavigate(`/admin/student/${student.id}`);
     };

  // Handle portfolio deletion
  const handleDeletePortfolio = async (portfolioId: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (!error) {
        setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
        setStudentPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
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

  const filteredProfiles = profiles.filter((p) =>
    p.nickname.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  /* ------------------------------------------------------------- */
  /*        1. FORCED PASSWORD CHANGE SCREEN (ONBOARDING)          */
  /* ------------------------------------------------------------- */
  if (user && mustChangePassword && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex flex-col justify-between">
        <header className="bg-white border-b border-[#e3e0f5] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SwpLogo size="sm" />
            <span className="font-bold text-sm text-[#1e1b2e]">SWP Security Onboarding</span>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs font-semibold text-[#6b6580] hover:text-[#dc2626]"
          >
            Sign Out
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e3e0f5] rounded-3xl p-8 max-w-md w-full shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1e1b2e]">Change Temporary Password</h2>
            <p className="text-xs text-[#6b6580] mt-1 mb-6">
              Hi <strong className="text-[#3e29bd]">@{user.nickname}</strong>, you logged in with a temporary password. Please set a new secret password before entering your portfolio folder.
            </p>

            {feedback && (
              <div className="mb-4 p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs font-medium">
                {feedback.message}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1e1b2e] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl focus:border-[#3e29bd] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e1b2e] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl focus:border-[#3e29bd] focus:bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-3 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {changingPassword ? 'Updating Password...' : 'Save New Password & Continue →'}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /*               2. ADMIN DASHBOARD (PASSWORD RESET)             */
  /* ------------------------------------------------------------- */
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e3e0f5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SwpLogo size="md" />
              <div>
                <h1 className="text-lg font-bold text-[#1e1b2e] leading-none">
                  SWP Admin Dashboard
                </h1>
                <p className="text-xs text-[#6b6580] mt-1">
                  Manage student accounts &amp; preview portfolios
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-[#6b6580] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-xl transition-colors border border-[#e3e0f5]"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {feedback && (
          <div
            className={`border-b px-4 py-2.5 text-xs ${
              feedback.type === 'success'
                ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d]'
                : feedback.type === 'error'
                ? 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'
                : 'bg-[#eeeafd] border-[#e3e0f5] text-[#3e29bd]'
            }`}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="font-semibold">{feedback.message}</span>
              <button onClick={() => setFeedback(null)} className="p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {viewingStudent ? (
            /* --- VIEWING A SPECIFIC STUDENT'S PORTFOLIOS (READ-ONLY PREVIEW) --- */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#e3e0f5] shadow-xs">
                <div>
                  <h2 className="text-lg font-bold text-[#1e1b2e] flex items-center gap-2">
                    <FolderCode className="w-5 h-5 text-[#3e29bd]" />
                    @{viewingStudent.nickname}'s Portfolios
                  </h2>
                  <p className="text-xs text-[#6b6580] mt-1">Admin read-only preview of this student's websites.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-2 bg-white border border-[#e3e0f5] text-[#1e1b2e] hover:bg-[#f8f7fc] text-xs font-bold rounded-xl transition-colors"
                >
                  ← Back to Students List
                </button>
              </div>

              {loadingStudentPortfolios ? (
                <div className="text-center py-12 text-sm text-[#6b6580] animate-pulse">
                  Loading student's websites...
                </div>
              ) : studentPortfolios.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#e3e0f5] rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm">
                  <p className="text-sm text-[#6b6580]">This student hasn't created any portfolios yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {studentPortfolios.map((portfolio) => (
                    <div key={portfolio.id} className="relative group">
                      <PortfolioCard
                        portfolio={portfolio}
                        onEdit={(id) => onNavigate(`/portfolio/${id}`)}
                        onDelete={() => {}} // Disabled for admin safety (read-only view)
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#3e29bd] border border-[#e3e0f5] shadow-xs pointer-events-none">
                        Read-Only Preview
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- DEFAULT ADMIN DASHBOARD (Table & Creation Form) --- */
            <>
              {/* Register New Student Card */}
              <div className="bg-white border border-[#e3e0f5] rounded-2xl p-6 shadow-xs">
                <h2 className="text-sm font-bold text-[#1e1b2e] flex items-center gap-2 mb-4">
                  <UserPlus className="w-4 h-4 text-[#3e29bd]" />
                  <span>Register New Student Account</span>
                </h2>
                <form onSubmit={handleCreateStudent} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Student nickname (e.g. alex_code)"
                    value={newStudentNick}
                    onChange={(e) => setNewStudentNick(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd]"
                  />
                  <input
                    type="text"
                    placeholder="Initial temporary password"
                    value={newStudentPass}
                    onChange={(e) => setNewStudentPass(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd]"
                  />
                  <button
                    type="submit"
                    disabled={creatingStudent}
                    className="px-5 py-2 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 disabled:opacity-50"
                  >
                    {creatingStudent ? 'Creating...' : '+ Add Student'}
                  </button>
                </form>
              </div>

              {/* Search & Refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="w-full sm:max-w-md">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    count={filteredProfiles.length}
                    totalCount={profiles.length}
                  />
                </div>

                <button
                  type="button"
                  onClick={fetchProfilesForAdmin}
                  className="inline-flex items-center gap-1.5 text-xs text-[#6b6580] hover:text-[#3e29bd] bg-white px-3 py-2 rounded-xl border border-[#e3e0f5]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingProfiles ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>

              {/* Students Password Management Table */}
              <div className="bg-white border border-[#e3e0f5] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8f7fc] border-b border-[#e3e0f5] text-[11px] font-bold text-[#6b6580] uppercase">
                      <th className="py-3.5 px-6">Student Nickname</th>
                      <th className="py-3.5 px-6">Generated Temporary Password</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e0f5] text-sm">
                    {loadingProfiles ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-xs text-[#6b6580]">
                          Loading registered students...
                        </td>
                      </tr>
                    ) : filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-xs text-[#6b6580]">
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      filteredProfiles.map((student) => {
                        const tempPass = tempPasswords[student.id];
                        return (
                          <tr key={student.id} className="hover:bg-[#f8f7fc]/60">
                            <td className="py-4 px-6 font-bold text-[#1e1b2e]">
                              @{student.nickname}
                            </td>
                            <td className="py-4 px-6">
                              {tempPass ? (
                                <div className="inline-flex items-center gap-2 bg-[#eeeafd] text-[#3e29bd] px-3 py-1 rounded-lg font-mono text-xs font-bold">
                                  <span>{tempPass}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(tempPass);
                                      setCopiedId(student.id);
                                      setTimeout(() => setCopiedId(null), 2000);
                                    }}
                                    className="hover:text-[#1e1b2e]"
                                    title="Copy temporary password"
                                  >
                                    {copiedId === student.id ? (
                                      <Check className="w-3.5 h-3.5 text-[#16a34a]" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-[#6b6580]">••••••••</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleViewStudentPortfolios(student)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0effb] hover:bg-[#e3e0f5] text-[#3e29bd] text-xs font-semibold rounded-xl transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View Websites</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={resettingId === student.id}
                                  onClick={() => handleGenerateTempPassword(student)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  <span>
                                    {resettingId === student.id
                                      ? 'Generating...'
                                      : 'Reset & Generate Temp Password'}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /*               3. LOGGED IN STUDENT FOLDER STATE               */
  /* ------------------------------------------------------------- */
  if (user) {
    return (
      <div className="min-h-screen bg-[#f8f7fc] flex flex-col">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e3e0f5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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
                    Private Folder Active
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

        {/* Logged-in Student Portfolio Folder */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e1b2e] tracking-tight">
                My Portfolios
              </h2>
              <p className="text-sm text-[#6b6580] mt-1">
                Only you can view and edit these projects inside your private folder (<strong className="text-[#1e1b2e]">@{user.nickname}</strong>).
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
            <div className="bg-white border-2 border-dashed border-[#e3e0f5] rounded-3xl p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center mx-auto mb-4">
                <FolderCode className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1e1b2e] mb-2">
                No portfolios yet
              </h3>
              <p className="text-sm text-[#6b6580] mb-6 max-w-md mx-auto">
                Your folder is empty — click <strong className="text-[#1e1b2e]">+ New Portfolio</strong> to start coding your HTML/CSS project.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
        <Footer />
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /*        4. LOGGED OUT STATE (CENTRALIZED LOGIN SCREEN)         */
  /* ------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col justify-between">
      <header className="bg-white border-b border-[#e3e0f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <SwpLogo size="md" />
            <div>
              <h1 className="text-xl font-extrabold text-[#1e1b2e] tracking-tight">
                SWP
              </h1>
              <p className="text-xs text-[#6b6580] font-medium">
                Student Webpage Project Viewer
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-[#e3e0f5] rounded-3xl p-8 w-full max-w-md shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#1e1b2e]">Sign In to SWP</h2>
            <p className="text-xs text-[#6b6580] mt-1">
              Enter your username and password to open your private portfolio folder.
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 bg-[#fef2f2] border border-[#fecaca] rounded-2xl flex items-center gap-2 text-xs text-[#dc2626]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1e1b2e] mb-1.5">
                Username / Nickname
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6b6580] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginNickname}
                  onChange={(e) => setLoginNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd] focus:bg-white text-[#1e1b2e] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1e1b2e] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6b6580] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd] focus:bg-white text-[#1e1b2e] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6580] hover:text-[#1e1b2e]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 mt-2"
            >
              {authLoading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};