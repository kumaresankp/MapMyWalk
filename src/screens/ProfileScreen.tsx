import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  ThemeSelector,
} from '../components';
import AuthInput from '../components/AuthInput';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import {
  RADII,
  SHADOWS,
  SPACING,
  ThemeColors,
  TYPOGRAPHY,
} from '../theme/theme';

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
  const {colors, resolvedTheme} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {
    user,
    profile,
    isGuest,
    isProfileLoading,
    updateProfile,
    signOut,
    deleteAccount,
    exitGuestMode,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
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

  const openDeleteModal = () => {
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteError(null);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    if (deletingAccount) {
      return;
    }
    setDeleteModalVisible(false);
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteError(null);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deletingAccount) {
      return;
    }
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Please enter your current password.');
      return;
    }
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE in all caps to confirm.');
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setDeleteModalVisible(false);
      Alert.alert(
        'Account Deleted',
        'Your MyWalkMap account and profile data have been permanently deleted.',
      );
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Unable to delete account.',
      );
    } finally {
      setDeletingAccount(false);
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
        <StatusBar
          barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        />
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

          <View style={styles.section}>
            <SectionHeader title="Appearance" />
            <ThemeSelector />
          </View>

          <View style={styles.guestNote}>
            <AppIcon name="shield" size={16} color={colors.primary} />
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
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
      />

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
              color={colors.accent}
              style={styles.profileSpinner}
            />
          ) : null}

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroEmail}>{email}</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AppIcon name="alert" size={16} color={colors.errorDark} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View style={styles.successBanner}>
            <AppIcon name="check" size={16} color={colors.successDark} />
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

        <View style={styles.section}>
          <SectionHeader title="Appearance" />
          <ThemeSelector />
        </View>

        <SecondaryButton
          label={loggingOut ? 'Signing Out…' : 'Logout'}
          tone="neutral"
          onPress={handleLogout}
          style={styles.logoutButton}
        />

        <SecondaryButton
          label="Delete Account"
          icon="trash"
          tone="danger"
          onPress={openDeleteModal}
          style={styles.deleteAccountButton}
        />
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <AppIcon name="trash" size={20} color={colors.error} />
              </View>
              <Text style={styles.modalTitle}>Delete Account Permanently?</Text>
            </View>

            <Text style={styles.modalDescription}>
              This permanently deletes your MyWalkMap account, authentication credentials, and profile data. This action cannot be undone.
            </Text>

            {deleteError ? (
              <View style={styles.modalErrorBanner}>
                <AppIcon name="alert" size={16} color={colors.errorDark} />
                <Text style={styles.modalErrorText}>{deleteError}</Text>
              </View>
            ) : null}

            <AuthInput
              label="Current Password"
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Enter your password"
              isPassword
              autoCapitalize="none"
              editable={!deletingAccount}
            />

            <AuthInput
              label="Type DELETE to confirm"
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!deletingAccount}
            />

            <View style={styles.modalButtons}>
              <SecondaryButton
                label="Cancel"
                tone="neutral"
                onPress={closeDeleteModal}
                style={styles.modalButtonHalf}
              />
              <PrimaryButton
                label={deletingAccount ? 'Deleting…' : 'Delete Forever'}
                variant="danger"
                onPress={handleConfirmDeleteAccount}
                disabled={deletingAccount}
                style={styles.modalButtonHalf}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.xxl,
    },
    heroCard: {
      backgroundColor: colors.secondarySoft,
      borderRadius: RADII.xl,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.primaryMuted,
      alignItems: 'center',
      ...SHADOWS.floating,
    },
    avatarCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.primaryMuted,
    },
    avatarImage: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    avatarInitials: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.textOnPrimary,
    },
    profileSpinner: {
      marginTop: SPACING.xs,
    },
    heroName: {
      marginTop: SPACING.md,
      fontSize: 22,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    heroEmail: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    section: {
      marginTop: SPACING.xl,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: RADII.lg,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: 'right',
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.borderSubtle,
    },
    editCard: {
      backgroundColor: colors.surface,
      borderRadius: RADII.lg,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.errorSoft,
      borderWidth: 1,
      borderColor: 'rgba(255, 77, 79, 0.35)',
      borderRadius: RADII.md,
      padding: SPACING.sm,
    },
    errorBannerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.errorDark,
    },
    successBanner: {
      marginTop: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.successSoft,
      borderWidth: 1,
      borderColor: 'rgba(46, 230, 110, 0.35)',
      borderRadius: RADII.md,
      padding: SPACING.sm,
    },
    successBannerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.successDark,
    },
    guestNote: {
      marginTop: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primaryMuted,
      borderRadius: RADII.md,
      padding: SPACING.md,
    },
    guestNoteText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: colors.textPrimary,
      lineHeight: 19,
    },
    actionSpacing: {
      marginTop: SPACING.lg,
    },
    logoutButton: {
      marginTop: SPACING.md,
    },
    deleteAccountButton: {
      marginTop: SPACING.sm,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: RADII.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.floating,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    modalIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.errorSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    modalDescription: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      fontSize: 13,
      marginBottom: SPACING.md,
    },
    modalErrorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      backgroundColor: colors.errorSoft,
      borderWidth: 1,
      borderColor: 'rgba(255, 77, 79, 0.35)',
      borderRadius: RADII.md,
      padding: SPACING.sm,
      marginBottom: SPACING.md,
    },
    modalErrorText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: colors.errorDark,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.xs,
    },
    modalButtonHalf: {
      flex: 1,
    },
  });

export default ProfileScreen;
