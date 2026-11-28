import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Linking} from 'react-native';
import type {Session, User} from '@supabase/supabase-js';

import {authConfig} from '../config/authConfig';
import {fetchProfile, upsertProfile} from '../services/ProfileService';
import {isSupabaseConfigured, supabase} from '../services/supabase';
import {UpdateProfileInput, UserProfile} from '../types/Auth';

type SignUpResult = {
  needsEmailVerification: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: UpdateProfileInput) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const EMAIL_REDIRECT_URL = 'mywalkmap://auth/callback';

const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY to your .env file, or continue as a guest.';

type ParsedAuthCallback = {
  accessToken: string | null;
  refreshToken: string | null;
};

const parseAuthCallbackUrl = (rawUrl: string): ParsedAuthCallback | null => {
  try {
    const parsed = new URL(rawUrl);
    if (
      parsed.protocol !== 'mywalkmap:' ||
      parsed.hostname !== 'auth' ||
      !parsed.pathname.startsWith('/callback')
    ) {
      return null;
    }

    const hashQuery = parsed.hash.startsWith('#')
      ? parsed.hash.slice(1)
      : parsed.hash;
    const hashParams = new URLSearchParams(hashQuery);
    const searchParams = parsed.searchParams;

    const accessToken =
      hashParams.get('access_token') ?? searchParams.get('access_token');
    const refreshToken =
      hashParams.get('refresh_token') ?? searchParams.get('refresh_token');

    return {accessToken, refreshToken};
  } catch {
    return null;
  }
};

const formatAuthError = (error: unknown, fallback: string): Error => {
  if (error instanceof Error) {
    const msg = error.message || fallback;
    if (
      msg.toLowerCase().includes('network request failed') ||
      msg.toLowerCase().includes('fetch')
    ) {
      return new Error(
        'Network error. Please check your internet connection and try again.',
      );
    }
    return new Error(msg);
  }
  return new Error(fallback);
};

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  const loadUserProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser || !isSupabaseConfigured) {
      setProfile(null);
      return;
    }

    setIsProfileLoading(true);
    try {
      const existing = await fetchProfile(activeUser.id);
      if (existing) {
        setProfile(existing);
      } else {
        const metaName =
          typeof activeUser.user_metadata?.full_name === 'string'
            ? activeUser.user_metadata.full_name
            : '';
        if (metaName) {
          const created = await upsertProfile(activeUser.id, {
            full_name: metaName,
          });
          setProfile(created);
        } else {
          setProfile(null);
        }
      }
    } catch {
      // Keep session intact even if profile fetch temporarily fails (e.g., offline)
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    const restoreSession = async () => {
      try {
        const {data, error} = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }
        if (error) {
          setSession(null);
          setProfile(null);
        } else {
          setSession(data.session ?? null);
          if (data.session?.user) {
            await loadUserProfile(data.session.user);
          }
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    const {data: authListener} = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) {
          return;
        }
        setSession(nextSession ?? null);
        if (nextSession?.user) {
          setIsGuest(false);
          loadUserProfile(nextSession.user);
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let isMounted = true;

    const handleIncomingUrl = async (url: string | null | undefined) => {
      if (!url || !isMounted) {
        return;
      }

      const tokens = parseAuthCallbackUrl(url);
      if (!tokens?.accessToken || !tokens.refreshToken) {
        return;
      }

      try {
        const {data, error} = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });

        if (!isMounted || error) {
          return;
        }

        if (data.session) {
          setSession(data.session);
          setIsGuest(false);
          await loadUserProfile(data.session.user);
        }
      } catch {
        // Ignore malformed or expired callback tokens without exposing token details
      }
    };

    Promise.resolve(Linking.getInitialURL())
      .then(initialUrl => handleIncomingUrl(initialUrl))
      .catch(() => {});

    const subscription = Linking.addEventListener('url', event => {
      handleIncomingUrl(event.url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [loadUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(NOT_CONFIGURED_MESSAGE);
    }

    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        setSession(data.session);
        setIsGuest(false);
      }
    } catch (error) {
      throw formatAuthError(error, 'Unable to sign in. Please try again.');
    }
  }, []);

  const signUp = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<SignUpResult> => {
      if (!isSupabaseConfigured) {
        throw new Error(NOT_CONFIGURED_MESSAGE);
      }

      try {
        const cleanName = fullName.trim();
        const {data, error} = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            ...(authConfig.requireEmailVerification
              ? {emailRedirectTo: EMAIL_REDIRECT_URL}
              : {}),
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.session) {
          setSession(data.session);
          setIsGuest(false);
          await loadUserProfile(data.session.user);
          return {needsEmailVerification: false};
        }

        if (!authConfig.requireEmailVerification) {
          throw new Error(
            'Account created, but no active session was returned. Ensure "Confirm email" is disabled in Supabase Dashboard → Authentication → Email.',
          );
        }

        return {needsEmailVerification: true};
      } catch (error) {
        throw formatAuthError(
          error,
          'Unable to create account. Please try again.',
        );
      }
    },
    [loadUserProfile],
  );

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        const {error} = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        throw formatAuthError(error, 'Unable to sign out right now.');
      }
    }
    setSession(null);
    setProfile(null);
    setIsGuest(false);
  }, []);

  const deleteAccount = useCallback(
    async (password: string) => {
      if (!isSupabaseConfigured) {
        throw new Error(NOT_CONFIGURED_MESSAGE);
      }
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('You must be signed in to delete your account.');
      }
      if (!password) {
        throw new Error('Please enter your current password to confirm.');
      }

      try {
        // Reauthenticate to verify identity and obtain a fresh access token
        const {data: reauthData, error: reauthError} =
          await supabase.auth.signInWithPassword({
            email: userEmail,
            password,
          });

        if (reauthError || !reauthData.session?.access_token) {
          throw new Error(
            reauthError?.message || 'Incorrect password. Reauthentication failed.',
          );
        }

        // Invoke server-side Edge Function using the verified user's JWT
        const {data: fnData, error: fnError} =
          await supabase.functions.invoke('delete-account', {
            headers: {
              Authorization: `Bearer ${reauthData.session.access_token}`,
            },
          });

        if (fnError || !fnData?.success) {
          let serverErrorMessage = fnData?.error;
          if (!serverErrorMessage && fnError) {
            const errorContext = (fnError as {context?: Response}).context;
            if (errorContext && typeof errorContext.json === 'function') {
              try {
                const readable =
                  typeof errorContext.clone === 'function'
                    ? errorContext.clone()
                    : errorContext;
                const body = await readable.json();
                if (typeof body?.error === 'string' && body.error) {
                  serverErrorMessage = body.error;
                }
              } catch {
                // Response body wasn't JSON
              }
            }
            if (!serverErrorMessage && errorContext?.status === 404) {
              serverErrorMessage =
                'Account deletion service is not deployed on the server (404).';
            }
          }
          throw new Error(
            serverErrorMessage ||
              fnError?.message ||
              'Unable to delete account on the server.',
          );
        }

        // Clear local auth session only after server confirmation
        try {
          await supabase.auth.signOut({scope: 'local'});
        } catch {
          // Ensure React auth state is cleared even if local signOut throws
        }
        setSession(null);
        setProfile(null);
        setIsGuest(false);
      } catch (error) {
        throw formatAuthError(
          error,
          'Unable to delete your account. Please try again.',
        );
      }
    },
    [session],
  );

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error(NOT_CONFIGURED_MESSAGE);
    }

    try {
      const {error} = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
      );
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      throw formatAuthError(
        error,
        'Unable to send password reset instructions.',
      );
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: UpdateProfileInput): Promise<UserProfile> => {
      if (!session?.user) {
        throw new Error('You must be signed in to update your profile.');
      }
      try {
        const updated = await upsertProfile(session.user.id, updates);
        setProfile(updated);
        return updated;
      } catch (error) {
        throw formatAuthError(error, 'Unable to update profile.');
      }
    },
    [session],
  );

  const refreshProfile = useCallback(async () => {
    await loadUserProfile(session?.user ?? null);
  }, [loadUserProfile, session]);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      isProfileLoading,
      isGuest,
      isAuthenticated: Boolean(session?.user),
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      resetPassword,
      updateProfile,
      refreshProfile,
      continueAsGuest,
      exitGuestMode,
    }),
    [
      session,
      profile,
      isLoading,
      isProfileLoading,
      isGuest,
      signIn,
      signUp,
      signOut,
      deleteAccount,
      resetPassword,
      updateProfile,
      refreshProfile,
      continueAsGuest,
      exitGuestMode,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
