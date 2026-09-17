import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, DEMO_PASSWORD } from '../supabaseClient';
import { nicknameToEmail } from '../lib/nicknameAuth';

interface NicknameCardProps {
  nickname: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSuccess: () => void;
}

export const NicknameCard: React.FC<NicknameCardProps> = ({
  nickname,
  isExpanded,
  onToggleExpand,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedSuccess, setUnlockedSuccess] = useState(false);

  const isDemo = nickname.startsWith('demo_');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your password to unlock this portfolio.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const email = nicknameToEmail(nickname);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg = signInError.message?.toLowerCase() || '';
        if (msg.includes('invalid') || msg.includes('credential') || msg.includes('password')) {
          setError(`Incorrect password for @${nickname}. Please verify and try again.`);
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError('Network connection error. Please check your internet connection.');
        } else {
          setError(`Unlock failed: ${signInError.message}`);
        }
        setLoading(false);
        return;
      }

      // Successful unlock
      setUnlockedSuccess(true);
      setTimeout(() => {
        setPassword('');
        onSuccess();
      }, 400);
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to the authentication service.');
      setLoading(false);
    }
  };

  return (
    <div
      id={`nickname-card-${nickname}`}
      className={`bg-white border rounded-2xl transition-all duration-200 shadow-sm flex flex-col justify-between overflow-hidden ${
        isExpanded
          ? 'border-[#3e29bd] ring-2 ring-[#3e29bd]/20 shadow-md'
          : 'border-[#e3e0f5] hover:border-[#3e29bd]/40 hover:shadow'
      }`}
    >
      <div
        onClick={() => {
          if (!isExpanded) {
            setError(null);
            onToggleExpand();
          }
        }}
        className={`p-5 select-none ${!isExpanded ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#eeeafd] text-[#3e29bd] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
              {nickname.slice(0, 2)}
            </div>
            <h3 className="font-semibold text-[#1e1b2e] text-base truncate tracking-tight">
              {nickname}
            </h3>
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              unlockedSuccess
                ? 'bg-[#16a34a] text-white'
                : isExpanded
                ? 'bg-[#3e29bd] text-white'
                : 'bg-[#f8f7fc] text-[#6b6580]'
            }`}
          >
            {unlockedSuccess ? (
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
            ) : isExpanded ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </div>
        </div>

        {!isExpanded && (
          <div className="mt-3 flex items-center justify-between text-xs text-[#6b6580]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6b6580]"></span>
              Private portfolio
            </span>
            <span className="text-[#3e29bd] font-medium hover:underline">
              Unlock &rarr;
            </span>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#f0effb] bg-[#faf9fe]/60">
          {unlockedSuccess ? (
            <div className="py-3 flex items-center justify-center gap-2 text-xs font-semibold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Password verified! Opening gallery...</span>
            </div>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor={`password-${nickname}`}
                    className="block text-xs font-semibold text-[#1e1b2e]"
                  >
                    Password
                  </label>
                  {isDemo && (
                    <button
                      type="button"
                      onClick={() => {
                        setPassword(DEMO_PASSWORD);
                        setError(null);
                      }}
                      className="text-[11px] text-[#3e29bd] hover:underline font-mono"
                      title="Click to auto-fill demo key"
                    >
                      Demo key: {DEMO_PASSWORD}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id={`password-${nickname}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    autoFocus
                    placeholder="Enter password"
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-xl text-[#1e1b2e] focus:outline-none transition-all pr-9 ${
                      error
                        ? 'border-[#dc2626] ring-1 ring-[#dc2626] bg-[#fef2f2]/30'
                        : 'border-[#e3e0f5] focus:ring-2 focus:ring-[#3e29bd] focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6580] hover:text-[#1e1b2e] p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Clear inline error banner */}
              {error && (
                <div className="flex items-start gap-1.5 text-xs text-[#dc2626] bg-[#fef2f2] px-3 py-2 rounded-xl border border-[#fecaca] animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  id={`submit-unlock-${nickname}`}
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Unlock</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onToggleExpand}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium text-[#6b6580] hover:text-[#1e1b2e] hover:bg-white rounded-xl border border-transparent hover:border-[#e3e0f5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
