import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  AppHeader,
  AppIcon,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from '../components';
import AuthInput from '../components/AuthInput';
import {useAuth} from '../context/AuthContext';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';

type Props = {
  navigation: any;
};

const getInitials = (name: string, email?: string): string => {
  const source = name.trim() || email?.split('@')[0] || 'MW';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const ProfileScreen = ({navigation}: Props) => {
  const {
    user,
    profile,
    isGuest,
    isProfileLoading,
    updateProfile,
    signOut,
    exitGuestMode,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const displayName =
    profile?.full_name ||
    (typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : '') ||
    'MyWalkMap Athlete';

  const email = user?.email ?? '';
  const avatarUrl = profile?.avatar_url ?? null;

  useEffect(() => {
    setFullNameInput(displayName === 'MyWalkMap Athlete' ? '' : displayName);
    setAvatarUrlInput(avatarUrl ?? '');
    setAvatarLoadError(false);
  }, [displayName, avatarUrl]);

  const handleSaveProfile = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fullNameInput.trim().length < 2) {
      setErrorMessage('Display name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullNameInput.trim(),
        avatar_url: avatarUrlInput.trim() || null,
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated.');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to update profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out?',
      'Your local workout history and GPS routes will remain safely saved on this device.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await signOut();
            } catch (err) {
              setErrorMessage(
                err instanceof Error ? err.message : 'Unable to sign out.',
              );
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  if (isGuest || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AppHeader title="Account" onBackPress={() => navigation.goBack()} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>GU</Text>
            </View>
            <Text style={styles.heroName}>Guest Mode</Text>
            <Text style={styles.heroEmail}>
              Using MyWalkMap without an account
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Workout Storage</Text>
              <Text style={styles.infoValue}>Local Device Only</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Sync</Text>
              <Text style={styles.infoValue}>Not Signed In</Text>
            </View>
          </View>

          <View style={styles.guestNote}>
            <AppIcon name="shield" size={16} color={COLORS.primary} />
            <Text style={styles.guestNoteText}>
              Sign in or create an account anytime. Your existing walks, runs, and routes on this device will stay intact.
            </Text>
          </View>

          <PrimaryButton
            label="Sign In or Create Account"
            onPress={exitGuestMode}
            style={styles.actionSpacing}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AppHeader title="Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={styles.heroCard}>
          {avatarUrl && !avatarLoadError ? (
            <Image
              source={{uri: avatarUrl}}
              style={styles.avatarImage}
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {getInitials(displayName, email)}
              </Text>
            </View>
          )}

          {isProfileLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.accent}
              style={styles.profileSpinner}
            />
          ) : null}

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{email}</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AppIcon name="alert" size={16} color={COLORS.errorDark} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <AppIcon name="check" size={16} color={COLORS.successDark} />
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        {isEditing ? (
          <View style={styles.section}>
            <SectionHeader title="Edit Profile" />
            <View style={styles.editCard}>
              <AuthInput
                label="Display Name"
                value={fullNameInput}
                onChangeText={setFullNameInput}
                placeholder="Your full name"
                autoCapitalize="words"
                editable={!saving}
              />

              <AuthInput
                label="Avatar URL (Optional)"
                value={avatarUrlInput}
                onChangeText={setAvatarUrlInput}
                placeholder="https://example.com/avatar.jpg"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!saving}
              />

              <View style={styles.editButtons}>
                <SecondaryButton
                  label="Cancel"
                  tone="neutral"
                  onPress={() => {
                    setIsEditing(false);
                    setErrorMessage(null);
                  }}
                  style={styles.editButtonHalf}
                />
                <PrimaryButton
                  label={saving ? 'Saving…' : 'Save'}
                  onPress={handleSaveProfile}
                  disabled={saving}
                  style={styles.editButtonHalf}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <SectionHeader title="Account Information" />
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{displayName}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : '—'}
                </Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Workout Data</Text>
                <Text style={styles.infoValue}>Stored Locally</Text>
              </View>
            </View>

            <SecondaryButton
              label="Edit Profile"
              tone="primary"
              onPress={() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                setIsEditing(true);
              }}
              style={styles.actionSpacing}
            />
          </View>
        )}

        <SecondaryButton
          label={loggingOut ? 'Signing Out…' : 'Logout'}
          tone="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: COLORS.secondarySoft,
    borderRadius: RADII.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    alignItems: 'center',
    ...SHADOWS.floating,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.primaryMuted,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
  },
  profileSpinner: {
    marginTop: SPACING.xs,
  },
  heroName: {
    marginTop: SPACING.md,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  heroEmail: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  editCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  editButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  editButtonHalf: {
    flex: 1,
  },
  errorBanner: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.errorSoft,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 79, 0.35)',
    borderRadius: RADII.md,
    padding: SPACING.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.errorDark,
  },
  successBanner: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(46, 230, 110, 0.35)',
    borderRadius: RADII.md,
    padding: SPACING.sm,
  },
  successBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.successDark,
  },
  guestNote: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  guestNoteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
  actionSpacing: {
    marginTop: SPACING.lg,
  },
  logoutButton: {
    marginTop: SPACING.md,
  },
});

export default ProfileScreen;
