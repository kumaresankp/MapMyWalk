// Supabase Edge Function: delete-account
// Deploy with: supabase functions deploy delete-account --no-verify-jwt
//
// Required Supabase Secrets (automatically available in Supabase Edge Runtime):
// - SUPABASE_URL
// - SUPABASE_ANON_KEY
// - SUPABASE_SERVICE_ROLE_KEY (server-side only, NEVER exposed to client)

import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders});
  }

  if (req.method !== 'POST') {
    return jsonResponse({error: 'Method not allowed.'}, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(
      {error: 'Server configuration is incomplete.'},
      500,
    );
  }

  try {
    const authHeader = req.headers.get('Authorization')?.trim() ?? '';
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader);
    const accessToken = bearerMatch?.[1]?.trim();

    if (!accessToken) {
      return jsonResponse(
        {error: 'Unauthorized. Missing or invalid Authorization header.'},
        401,
      );
    }

    // Verify the caller's JWT with Supabase Auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {Authorization: `Bearer ${accessToken}`},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const {
      data: {user},
      error: userError,
    } = await userClient.auth.getUser(accessToken);

    if (userError || !user) {
      return jsonResponse(
        {error: 'Unauthorized. Invalid or expired session.'},
        401,
      );
    }

    const verifiedUserId = user.id;

    // Admin client using server-only service_role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Explicitly remove only the verified user's public.profiles row
    const {error: profileDeleteError} = await adminClient
      .from('profiles')
      .delete()
      .eq('id', verifiedUserId);

    if (profileDeleteError) {
      console.error('Profile delete error:', profileDeleteError);
      return jsonResponse(
        {
          error: `Failed to delete user profile data: ${profileDeleteError.message}`,
        },
        500,
      );
    }

    // 2. Delete only the verified user's Supabase Auth account
    const {error: authDeleteError} =
      await adminClient.auth.admin.deleteUser(verifiedUserId);

    if (authDeleteError) {
      console.error('Auth delete error:', authDeleteError);
      return jsonResponse(
        {
          error: `Failed to delete authentication account: ${authDeleteError.message}`,
        },
        500,
      );
    }

    return jsonResponse({
      success: true,
      message: 'Account and associated profile data permanently deleted.',
    });
  } catch {
    return jsonResponse(
      {error: 'Unexpected server error while deleting account.'},
      500,
    );
  }
});
