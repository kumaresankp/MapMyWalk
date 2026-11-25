/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@maplibre/maplibre-react-native', () => ({
  Map: ({children}: {children?: React.ReactNode}) => children,
  Camera: ({children}: {children?: React.ReactNode}) => children,
  GeoJSONSource: ({children}: {children?: React.ReactNode}) => children,
  Layer: () => null,
  Marker: ({children}: {children?: React.ReactNode}) => children,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockGetSession = jest.fn();
const mockSetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockMaybeSingle = jest.fn();
const mockUpsertSingle = jest.fn();

jest.mock('../src/services/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      setSession: (...args: any[]) => mockSetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: any[]) =>
        mockResetPasswordForEmail(...args),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: (...args: any[]) => mockMaybeSingle(...args),
        }),
      }),
      upsert: () => ({
        select: () => ({
          single: (...args: any[]) => mockUpsertSingle(...args),
        }),
      }),
    }),
  },
}));

import {Linking} from 'react-native';
import {AuthProvider, useAuth} from '../src/context/AuthContext';
import ForgotPasswordScreen from '../src/screens/ForgotPasswordScreen';
import LoginScreen from '../src/screens/LoginScreen';
import ProfileScreen from '../src/screens/ProfileScreen';
import SignUpScreen from '../src/screens/SignUpScreen';
import WelcomeScreen from '../src/screens/WelcomeScreen';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockGetSession.mockResolvedValue({data: {session: null}, error: null});
  mockOnAuthStateChange.mockReturnValue({
    data: {subscription: {unsubscribe: jest.fn()}},
  });
  mockMaybeSingle.mockResolvedValue({data: null, error: null});
});

afterEach(() => {
  jest.useRealTimers();
});

test('WelcomeScreen renders MyWalkMap auth options and supports Continue as Guest', async () => {
  const navigate = jest.fn();
  let authState: ReturnType<typeof useAuth> | null = null;

  const Probe = () => {
    authState = useAuth();
    return null;
  };

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <Probe />
        <WelcomeScreen navigation={{navigate}} />
      </AuthProvider>,
    );
  });

  const json = JSON.stringify(renderer.toJSON());
  expect(json).toContain('MyWalkMap');
  expect(json).toContain('Sign In');
  expect(json).toContain('Create Account');
  expect(json).toContain('Continue as Guest');

  const guestBtn = renderer.root.findByProps({
    accessibilityLabel: 'Continue as Guest',
  });
  await ReactTestRenderer.act(async () => {
    guestBtn.props.onPress();
  });

  expect(authState!.isGuest).toBe(true);
});

test('LoginScreen handles valid login and invalid credentials error', async () => {
  mockSignInWithPassword.mockResolvedValueOnce({
    data: {session: null},
    error: {message: 'Invalid login credentials'},
  });

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <LoginScreen navigation={{goBack: jest.fn(), navigate: jest.fn(), replace: jest.fn()}} />
      </AuthProvider>,
    );
  });

  const emailInput = renderer.root.findByProps({placeholder: 'you@example.com'});
  const passInput = renderer.root.findByProps({placeholder: 'Enter your password'});

  await ReactTestRenderer.act(async () => {
    emailInput.props.onChangeText('runner@example.com');
    passInput.props.onChangeText('wrongpass');
  });

  const submitBtn = renderer.root.findAllByProps({accessibilityRole: 'button'})
    .find(node => node.props.accessibilityLabel === 'Sign In');

  await ReactTestRenderer.act(async () => {
    await submitBtn!.props.onPress();
  });

  expect(mockSignInWithPassword).toHaveBeenCalledWith({
    email: 'runner@example.com',
    password: 'wrongpass',
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('Invalid login credentials');
});

test('SignUpScreen displays email verification notice when confirmation is required', async () => {
  mockSignUp.mockResolvedValueOnce({
    data: {user: {id: 'user-1'}, session: null},
    error: null,
  });

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <SignUpScreen navigation={{goBack: jest.fn(), replace: jest.fn()}} />
      </AuthProvider>,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({placeholder: 'Alex Morgan'})
      .props.onChangeText('Alex Morgan');
    renderer.root
      .findByProps({placeholder: 'you@example.com'})
      .props.onChangeText('alex@example.com');
    renderer.root
      .findByProps({placeholder: 'At least 6 characters'})
      .props.onChangeText('secret123');
    renderer.root
      .findByProps({placeholder: 'Re-enter your password'})
      .props.onChangeText('secret123');
  });

  const submitBtn = renderer.root
    .findAllByProps({accessibilityRole: 'button'})
    .find(node => node.props.accessibilityLabel === 'Create Account');

  await ReactTestRenderer.act(async () => {
    await submitBtn!.props.onPress();
  });

  expect(mockSignUp).toHaveBeenCalledWith({
    email: 'alex@example.com',
    password: 'secret123',
    options: {
      emailRedirectTo: 'mywalkmap://auth/callback',
      data: {
        full_name: 'Alex Morgan',
      },
    },
  });
  expect(JSON.stringify(renderer.toJSON())).toContain('Check your email');
});

test('AuthProvider establishes session from cold-start and runtime mywalkmap://auth/callback deep links', async () => {
  const verifiedSession = {
    user: {
      id: 'user-verified',
      email: 'verified@example.com',
      user_metadata: {full_name: 'Verified User'},
    },
  };

  mockSetSession.mockResolvedValue({
    data: {session: verifiedSession},
    error: null,
  });

  const getInitialUrlSpy = jest
    .spyOn(Linking, 'getInitialURL')
    .mockResolvedValueOnce(
      'mywalkmap://auth/callback#access_token=acc_123&refresh_token=ref_456&type=signup',
    );

  let urlListener: ((event: {url: string}) => void) | undefined;
  const removeMock = jest.fn();
  const addEventListenerSpy = jest
    .spyOn(Linking, 'addEventListener')
    .mockImplementation((_eventName, handler) => {
      urlListener = handler as (event: {url: string}) => void;
      return {remove: removeMock} as any;
    });

  let authState: ReturnType<typeof useAuth> | null = null;
  const Probe = () => {
    authState = useAuth();
    return null;
  };

  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
  });

  expect(mockSetSession).toHaveBeenCalledWith({
    access_token: 'acc_123',
    refresh_token: 'ref_456',
  });
  expect(authState!.isAuthenticated).toBe(true);

  await ReactTestRenderer.act(async () => {
    urlListener?.({
      url: 'mywalkmap://auth/callback?access_token=acc_789&refresh_token=ref_012',
    });
  });

  expect(mockSetSession).toHaveBeenCalledWith({
    access_token: 'acc_789',
    refresh_token: 'ref_012',
  });

  getInitialUrlSpy.mockRestore();
  addEventListenerSpy.mockRestore();
});

test('ForgotPasswordScreen sends reset link and shows confirmation', async () => {
  mockResetPasswordForEmail.mockResolvedValueOnce({error: null});

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <ForgotPasswordScreen navigation={{goBack: jest.fn()}} />
      </AuthProvider>,
    );
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({placeholder: 'you@example.com'})
      .props.onChangeText('alex@example.com');
  });

  const submitBtn = renderer.root
    .findAllByProps({accessibilityRole: 'button'})
    .find(node => node.props.accessibilityLabel === 'Send Reset Link');

  await ReactTestRenderer.act(async () => {
    await submitBtn!.props.onPress();
  });

  expect(mockResetPasswordForEmail).toHaveBeenCalledWith('alex@example.com');
  expect(JSON.stringify(renderer.toJSON())).toContain('Reset email sent');
});

test('ProfileScreen loads authenticated user profile and supports editing', async () => {
  mockGetSession.mockResolvedValueOnce({
    data: {
      session: {
        user: {
          id: 'user-123',
          email: 'alex@example.com',
          created_at: '2026-01-01T00:00:00Z',
          user_metadata: {full_name: 'Alex Morgan'},
        },
      },
    },
    error: null,
  });

  mockMaybeSingle.mockResolvedValueOnce({
    data: {
      id: 'user-123',
      full_name: 'Alex Morgan',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    error: null,
  });

  mockUpsertSingle.mockResolvedValueOnce({
    data: {
      id: 'user-123',
      full_name: 'Alex Runner',
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    },
    error: null,
  });

  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <ProfileScreen navigation={{goBack: jest.fn()}} />
      </AuthProvider>,
    );
  });

  const initialJson = JSON.stringify(renderer.toJSON());
  expect(initialJson).toContain('Alex Morgan');
  expect(initialJson).toContain('alex@example.com');

  const editBtn = renderer.root
    .findAllByProps({accessibilityRole: 'button'})
    .find(node => node.props.accessibilityLabel === 'Edit Profile');

  await ReactTestRenderer.act(async () => {
    editBtn!.props.onPress();
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({placeholder: 'Your full name'})
      .props.onChangeText('Alex Runner');
  });

  const saveBtn = renderer.root
    .findAllByProps({accessibilityRole: 'button'})
    .find(node => node.props.accessibilityLabel === 'Save');

  await ReactTestRenderer.act(async () => {
    await saveBtn!.props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('Alex Runner');
  expect(JSON.stringify(renderer.toJSON())).toContain('Profile updated.');
});
