/**
 * Central authentication configuration for MyWalkMap.
 *
 * IMPORTANT: This flag controls the mobile app's UI and signup flow only.
 * Keep it aligned with Supabase Dashboard -> Authentication -> Providers ->
 * Email -> "Confirm email":
 * - `false`: "Confirm email" disabled in Supabase -> immediate session & Home navigation
 * - `true`: "Confirm email" enabled in Supabase -> show email verification instructions
 */
export const authConfig = {
  requireEmailVerification: true,
};
