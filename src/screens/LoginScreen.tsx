import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AppHeader, AppIcon, PrimaryButton} from '../components';
import AuthInput from '../components/AuthInput';
import {useAuth} from '../context/AuthContext';
import {COLORS, RADII, SPACING, TYPOGRAPHY} from '../theme/theme';

type Props = {
  navigation: any;
};

const LoginScreen = ({navigation}: Props) => {
  const {signIn} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(trimmedEmail, password);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to sign in.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AppHeader title="Sign In" onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>
            Sign in to access your MyWalkMap profile and account settings.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <AppIcon name="alert" size={16} color={COLORS.errorDark} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <AuthInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            isPassword
            autoCapitalize="none"
            editable={!submitting}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
            disabled={submitting}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <PrimaryButton
            label={submitting ? 'Signing In…' : 'Sign In'}
            onPress={handleLogin}
            disabled={submitting}
            style={styles.submitButton}
          />

          {submitting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={styles.loader}
            />
          ) : null}

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable
              onPress={() => navigation.replace('SignUp')}
              disabled={submitting}>
              <Text style={styles.footerLink}>Create Account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heading: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.textPrimary,
  },
  subheading: {
    ...TYPOGRAPHY.body,
    marginTop: 6,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.35)',
    borderRadius: RADII.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.errorDark,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  submitButton: {
    marginTop: SPACING.xs,
  },
  loader: {
    marginTop: SPACING.md,
  },
  footerRow: {
    marginTop: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    ...TYPOGRAPHY.body,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default LoginScreen;
