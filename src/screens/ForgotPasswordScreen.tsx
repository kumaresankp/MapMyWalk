import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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

const ForgotPasswordScreen = ({navigation}: Props) => {
  const {resetPassword} = useAuth();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setErrorMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(trimmedEmail);
      setSent(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to send reset instructions.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <AppHeader
          title="Reset Password"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.sentWrap}>
          <EmptyState
            icon="check"
            title="Reset email sent"
            description={`If an account exists for ${email.trim().toLowerCase()}, you will receive password reset instructions shortly.`}
            actionLabel="Back to Sign In"
            onActionPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        title="Reset Password"
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Forgot your password?</Text>
          <Text style={styles.subheading}>
            Enter your account email and we'll send you a link to reset your password.
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

          <PrimaryButton
            label={submitting ? 'Sending Link…' : 'Send Reset Link'}
            onPress={handleReset}
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
  sentWrap: {
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
});

export default ForgotPasswordScreen;
