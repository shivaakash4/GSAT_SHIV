'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setLoading(false);
    }, 5000);

    const restoreSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (active) setUser(session?.user ?? null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) {
          window.clearTimeout(timeout);
          setLoading(false);
        }
      }
    };

    void restoreSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return { user, loading };
}
