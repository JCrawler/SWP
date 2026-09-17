import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { emailToNickname } from '../lib/nicknameAuth';

export interface AuthState {
  user: {
    id: string;
    email: string;
    nickname: string;
  } | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<{ id: string; email: string; nickname: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const resolveProfileNickname = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', userId)
        .single();

      if (!error && data?.nickname) {
        return data.nickname;
      }
    } catch {
      // ignore
    }
    return emailToNickname(email);
  }, []);

  const handleSession = useCallback(async (session: any) => {
    if (session?.user) {
      const userId = session.user.id;
      const email = session.user.email || '';
      const nickname = await resolveProfileNickname(userId, email);
      setUser({
        id: userId,
        email,
        nickname: nickname || emailToNickname(email),
      });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [resolveProfileNickname]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          await handleSession(session);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event: string, session: any) => {
      if (mounted) {
        await handleSession(session);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [handleSession]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      const nickname = await resolveProfileNickname(user.id, user.email);
      setUser(prev => (prev ? { ...prev, nickname } : null));
    }
  }, [user?.id, user?.email, resolveProfileNickname]);

  return {
    user,
    loading,
    signOut,
    refreshProfile,
  };
}
