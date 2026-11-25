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

import {AppHeader, AppIcon, EmptyState, PrimaryButton} from '../components';
import AuthInput from '../components/AuthInput';
import {useAuth} from '../context/AuthContext';
import {COLORS, RADII, SPACING, TYPOGRAPHY} from '../theme/theme';

type Props = {
  navigation: any;
};

const SignUpScreen = ({navigation}: Props) => {
  const {signUp} = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSignUp = async () => {
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await signUp(trimmedName, trimmedEmail, password);
      if (result.needsEmailVerification) {
        setNeedsVerification(true);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to create account.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <AppHeader
          title="Verify Email"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.verificationWrap}>
          <EmptyState
            icon="check"
            title="Check your email"
            description={`We sent a verification link to ${email.trim().toLowerCase()}. Open the link to verify your email and return to MyWalkMap automatically.`}
            actionLabel="Go to Sign In"
            onActionPress={() => navigation.replace('Login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        title="Create Account"
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Join MyWalkMap</Text>
          <Text style={styles.subheading}>
            Create your account to manage your profile while keeping all workout routes private on your device.
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <AppIcon name="alert" size={16} color={COLORS.errorDark} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <AuthInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Alex Morgan"
            autoCapitalize="words"
            editable={!submitting}
          />

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
            placeholder="At least 6 characters"
            isPassword
            autoCapitalize="none"
            editable={!submitting}
          />

          <AuthInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            isPassword
            autoCapitalize="none"
            editable={!submitting}
          />

          <PrimaryButton
            label={submitting ? 'Creating Account…' : 'Create Account'}
            onPress={handleSignUp}
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
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              onPress={() => navigation.replace('Login')}
              disabled={submitting}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  verificationWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heading: {
    ...TYPOGRAPHY.titleLarge,
    color: COLORS.secondary,
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
    borderColor: '#FECDCA',
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
  submitButton: {
    marginTop: SPACING.sm,
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

export default SignUpScreen;
