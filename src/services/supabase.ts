import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

import {ENV, isSupabaseConfigured} from '../config/env';

// Fallback placeholder prevents createClient from throwing during Jest or before .env setup.
// All auth/profile operations check `isSupabaseConfigured` before making network calls.
const clientUrl = ENV.supabaseUrl || 'https://placeholder.supabase.co';
const clientKey = ENV.supabasePublishableKey || 'placeholder-publishable-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export {isSupabaseConfigured};
