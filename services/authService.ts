import { supabase } from '@/lib/supabase';
import { notifyAdmin } from '@/services/emailService';

export async function signUp(email: string, password: string) {
  // Sign up with no email confirmation — user is logged in immediately
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
      data: { email_confirm: false },
    },
  });
  if (error) return { data, error };

  // If session already exists (email confirm disabled in dashboard), return it
  if (data.session) return { data, error: null };

  // Fallback: auto sign in right after signup
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error && data.user) {
    notifyAdmin(data.user.email!);
  }
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
