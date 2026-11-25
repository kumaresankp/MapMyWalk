import {SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL} from '@env';

const rawUrl = (SUPABASE_URL ?? '').trim();
const rawKey = (SUPABASE_PUBLISHABLE_KEY ?? '').trim();

const isPlaceholderUrl =
  !rawUrl || rawUrl.includes('your-project-id.supabase.co');
const isPlaceholderKey =
  !rawKey || rawKey === 'your-supabase-publishable-key';

export const ENV = {
  supabaseUrl: isPlaceholderUrl ? '' : rawUrl,
  supabasePublishableKey: isPlaceholderKey ? '' : rawKey,
} as const;

export const isSupabaseConfigured = Boolean(
  ENV.supabaseUrl && ENV.supabasePublishableKey,
);
