import {UpdateProfileInput, UserProfile} from '../types/Auth';
import {isSupabaseConfigured, supabase} from './supabase';

/**
 * Reads the authenticated user's own row from public.profiles.
 * Protected by Supabase RLS (auth.uid() = id).
 */
export const fetchProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  const {data, error} = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || 'Unable to load user profile.');
  }

  return data as UserProfile | null;
};

/**
 * Updates (or inserts if missing) the authenticated user's own profile.
 * Protected by Supabase RLS INSERT and UPDATE policies (auth.uid() = id).
 */
export const upsertProfile = async (
  userId: string,
  updates: UpdateProfileInput,
): Promise<UserProfile> => {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to .env.',
    );
  }

  const cleanName = updates.full_name.trim();
  const cleanAvatar = updates.avatar_url?.trim() || null;

  const {data, error} = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        full_name: cleanName,
        avatar_url: cleanAvatar,
      },
      {onConflict: 'id'},
    )
    .select('id, full_name, avatar_url, created_at, updated_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Unable to update your profile.');
  }

  return data as UserProfile;
};
