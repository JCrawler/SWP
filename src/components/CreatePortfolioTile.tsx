import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  KeyRound,
  Check,
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { nicknameToEmail, validateNickname, validatePassword } from '../lib/nicknameAuth';

interface CreatePortfolioTileProps {
  onSuccess: () => void;
  onSelectExistingNickname?: (nickname: string) => void;
}

export const CreatePortfolioTile: React.FC<CreatePortfolioTileProps> = ({
  onSuccess,
  onSelectExistingNickname,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [takenNickname, setTakenNickname] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  // Live validation checks for helper indicators
  const trimmedNick = nickname.trim();
  const isNickLengthValid = trimmedNick.length >= 3 && trimmedNick.length <= 20;
  const isNickCharsValid = /^[a-zA-Z0-9_-]+$/.test(trimmedNick);
  const isPasswordLengthValid = password.length >= 6;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTakenNickname(null);

    // 1. Client-side validation
    const nickValidation = validateNickname(nickname);
    if (!nickValidation.isValid) {
      setError(nickValidation.error || 'Invalid nickname.');
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.isValid) {
      setError(passValidation.error || 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const cleanNickname = trimmedNick.toLowerCase();
      const syntheticEmail = nicknameToEmail(cleanNickname);

      // 2. Check if nickname already exists in profiles
      const { data: existingProfiles, error: queryError } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('nickname', cleanNickname);

      if (queryError && queryError.message && !queryError.message.includes('No rows')) {
        console.warn('Profile query notice:', queryError.message);
      }

      if (existingProfiles && existingProfiles.length > 0) {
        // Nickname already exists
        setError(`Nickname "${cleanNickname}" is already taken.`);
        setTakenNickname(cleanNickname);
        setLoading(false);
        return;
      }

      // 3. Register user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: syntheticEmail,
        password,
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || '';
        if (msg.includes('already registered') || msg.includes('user already exists')) {
          setError(`Nickname "${cleanNickname}" already exists. If this is you, unlock it below.`);
          setTakenNickname(cleanNickname);
          setLoading(false);
          return;
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setError('Network error: Unable to connect to Supabase auth service.');
        } else {
          setError(signUpError.message || 'Unable to register account. Please try again.');
        }
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError('Authentication succeeded but user ID was not returned.');
        setLoading(false);
        return;
      }

      // 4. Insert row into profiles table
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId,
          nickname: cleanNickname,
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.warn('Profile insert note:', profileError.message);
      }

      // Show success feedback
      setCreatedSuccess(true);
      setTimeout(() => {
        setNickname('');
        setPassword('');
        setIsExpanded(false);
        setCreatedSuccess(false);
        onSuccess();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Unexpected error creating portfolio account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="create-portfolio-tile"
      className={`rounded-2xl transition-all duration-200 border-2 overflow-hidden flex flex-col justify-between ${
        isExpanded
          ? 'bg-white border-[#3e29bd] shadow-md ring-2 ring-[#3e29bd]/20'
          : 'bg-[#eeeafd]/40 border-dashed border-[#3e29bd]/40 hover:border-[#3e29bd] hover:bg-[#eeeafd]/70 cursor-pointer'
      }`}
    >
      {!isExpanded ? (
        <div
          onClick={() => {
            setError(null);
            setTakenNickname(null);
            setIsExpanded(true);
          }}
          className="p-6 h-full flex flex-col items-center justify-center text-center min-h-[148px]"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#3e29bd] text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="font-bold text-[#1e1b2e] text-sm mb-1 flex items-center gap-1.5">
            <span>Create your portfolio</span>
            <Sparkles className="w-3.5 h-3.5 text-[#3e29bd]" />
          </h3>
          <p className="text-xs text-[#6b6580]">
            Pick a nickname &amp; set a password
          </p>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-[#1e1b2e] text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#3e29bd]" />
              <span>Create New Portfolio</span>
            </h3>
            <span className="text-[11px] font-medium text-[#3e29bd] bg-[#eeeafd] px-2 py-0.5 rounded-full">
              Instant Setup
            </span>
          </div>

          {createdSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4">
              <CheckCircle2 className="w-8 h-8 text-[#16a34a] animate-bounce" />
              <p className="text-xs font-bold text-[#15803d]">Account Created Successfully!</p>
              <p className="text-[11px] text-[#166534]">Entering your personal portfolio workspace...</p>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="new-nickname-input"
                    className="block text-xs font-semibold text-[#1e1b2e]"
                  >
                    Nickname
                  </label>
                  <span className="text-[10px] text-[#6b6580] font-mono">
                    {trimmedNick.length}/20
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="new-nickname-input"
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (error) setError(null);
                      if (takenNickname) setTakenNickname(null);
                    }}
                    autoFocus
                    placeholder="e.g. alex_code"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl text-[#1e1b2e] focus:outline-none transition-all ${
                      error && !isNickLengthValid
                        ? 'border-[#dc2626] ring-1 ring-[#dc2626]'
                        : 'border-[#e3e0f5] focus:ring-2 focus:ring-[#3e29bd] focus:border-transparent'
                    }`}
                  />
                  {trimmedNick.length >= 3 && isNickCharsValid && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#16a34a]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-[#6b6580] mt-1">
                  3–20 characters. Letters, numbers, hyphens (-), and underscores (_).
                </p>
              </div>

              <div>
                <label
                  htmlFor="new-password-input"
                  className="block text-xs font-semibold text-[#1e1b2e] mb-1"
                >
                  Secret Password
                </label>
                <div className="relative">
                  <input
                    id="new-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Minimum 6 characters"
                    className={`w-full px-3 py-2 text-xs bg-white border rounded-xl text-[#1e1b2e] focus:outline-none transition-all pr-8 ${
                      error && !isPasswordLengthValid
                        ? 'border-[#dc2626] ring-1 ring-[#dc2626]'
                        : 'border-[#e3e0f5] focus:ring-2 focus:ring-[#3e29bd] focus:border-transparent'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6580] hover:text-[#1e1b2e] p-0.5"
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

              {/* Inline Error and Quick Resolution Banner */}
              {error && (
                <div className="p-3 text-xs text-[#dc2626] bg-[#fef2f2] rounded-xl border border-[#fecaca] space-y-2">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dc2626]" />
                    <span className="leading-snug">{error}</span>
                  </div>

                  {takenNickname && onSelectExistingNickname && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsExpanded(false);
                        onSelectExistingNickname(takenNickname);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#3e29bd] hover:underline bg-white px-2 py-1 rounded-lg border border-[#e3e0f5]"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Unlock @{takenNickname} instead &rarr;</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  id="submit-create-portfolio-btn"
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#3e29bd] hover:bg-[#331f9e] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create &amp; Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setError(null);
                    setTakenNickname(null);
                  }}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium text-[#6b6580] hover:text-[#1e1b2e] hover:bg-[#f8f7fc] rounded-xl transition-colors"
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
