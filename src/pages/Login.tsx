import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { SwpLogo } from '../components/SwpLogo';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { id: string; nickname: string; role: 'admin' | 'student'; must_change_password?: boolean }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanId = identifier.trim().toLowerCase();

    try {
      // 1. Check if user is an Admin
      // (Admins can log in via email e.g. admin@school.edu or username 'admin')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanId.includes('@') ? cleanId : `${cleanId}@swp.internal`,
        password,
      });

      if (!authError && authData.user) {
        // Check profile role in Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, nickname, role, must_change_password')
          .eq('id', authData.user.id)
          .single();

        if (profile?.role === 'admin') {
          onLoginSuccess({
            id: profile.id,
            nickname: profile.nickname || 'Admin',
            role: 'admin',
          });
          return;
        }

        if (profile) {
          onLoginSuccess({
            id: profile.id,
            nickname: profile.nickname,
            role: 'student',
            must_change_password: profile.must_change_password,
          });
          return;
        }
      }

      // 2. Student Authentication via Profiles table
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('id, nickname, password, role, must_change_password')
        .eq('nickname', cleanId)
        .single();

      if (studentError || !student) {
        setError('Invalid username or password.');
        return;
      }

      // Verify student password
      if (student.password !== password) {
        setError('Invalid username or password.');
        return;
      }

      onLoginSuccess({
        id: student.id,
        nickname: student.nickname,
        role: (student.role as 'admin' | 'student') || 'student',
        must_change_password: student.must_change_password || false,
      });
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f7fc] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-white border border-[#e3e0f5] rounded-2xl p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <SwpLogo size="lg" />
          </div>
          <h1 className="text-xl font-bold text-[#1e1b2e]">Student Webpage Project</h1>
          <p className="text-xs text-[#6b6580] mt-1">Please log in to access your portfolio workspace</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a4458] mb-1.5">
              Username / Nickname
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8e8a9f] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. richmond"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd] focus:bg-white transition-all text-[#1e1b2e]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4a4458] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8e8a9f] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#f8f7fc] border border-[#e3e0f5] rounded-xl outline-none focus:border-[#3e29bd] focus:bg-white transition-all text-[#1e1b2e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In →</span>
            )}
          </button>
        </form>
      </div>
      <p className="mt-6 text-xs text-[#8e8a9f]">Created by Jholichi S. Tempra</p>
    </div>
  );
};