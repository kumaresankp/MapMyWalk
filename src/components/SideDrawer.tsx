import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useTheme} from '../context/ThemeContext';
import {RADII, SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.8, 320);

type DrawerNavItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon: AppIconName;
  active?: boolean;
  onPress: () => void;
};

type SideDrawerProps = {
  visible: boolean;
  onClose: () => void;
  displayName: string;
  email?: string | null;
  initials: string;
  avatarUrl?: string | null;
  isGuest: boolean;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onNavigateHistory: () => void;
  onStartWalk: () => void;
  onStartRun: () => void;
  onOpenPrivacy: () => void;
  onAuthAction: () => void;
};

/**
 * Slide-out side navigation drawer for quick access to screens, workouts, and account actions.
 */
const SideDrawer = ({
  visible,
  onClose,
  displayName,
  email,
  initials,
  avatarUrl,
  isGuest,
  onNavigateHome,
  onNavigateProfile,
  onNavigateHistory,
  onStartWalk,
  onStartRun,
  onOpenPrivacy,
  onAuthAction,
}: SideDrawerProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(-DRAWER_WIDTH);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleClose = (afterClose?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      afterClose?.();
    });
  };

  const navItems: DrawerNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      subtitle: 'Dashboard & weekly activity',
      icon: 'home',
      active: true,
      onPress: () => handleClose(onNavigateHome),
    },
    {
      id: 'profile',
      label: 'Profile & Account',
      subtitle: isGuest ? 'Guest preferences' : 'Edit name, avatar & security',
      icon: 'user',
      onPress: () => handleClose(onNavigateProfile),
    },
    {
      id: 'history',
      label: 'Workout History',
      subtitle: 'Past routes, splits & totals',
      icon: 'history',
      onPress: () => handleClose(onNavigateHistory),
    },
    {
      id: 'walk',
      label: 'Start Walk',
      subtitle: 'Steady outdoor pace',
      icon: 'walk',
      onPress: () => handleClose(onStartWalk),
    },
    {
      id: 'run',
      label: 'Start Run',
      subtitle: 'High-tempo cardio',
      icon: 'run',
      onPress: () => handleClose(onStartRun),
    },
    {
      id: 'privacy',
      label: 'Privacy & Data',
      subtitle: 'Local GPS storage details',
      icon: 'shield',
      onPress: () => handleClose(onOpenPrivacy),
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => handleClose()}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, {opacity: backdropAnim}]}>
          <Pressable
            style={styles.backdropPress}
            onPress={() => handleClose()}
            accessibilityRole="button"
            accessibilityLabel="Close navigation menu"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              transform: [{translateX: slideAnim}],
            },
          ]}>
          <SafeAreaView style={styles.drawerSafe}>
            <View style={styles.drawerHeader}>
              <TouchableOpacity
                onPress={() => handleClose(onNavigateProfile)}
                style={styles.userRow}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Profile">
                <View style={styles.avatarRing}>
                  {avatarUrl ? (
                    <Image
                      source={{uri: avatarUrl}}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.userMeta}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName || (isGuest ? 'Guest User' : 'MyWalkMap User')}
                  </Text>
                  <Text style={styles.userSubtext} numberOfLines={1}>
                    {isGuest ? 'Guest Mode' : email || 'Signed In'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleClose()}
                style={styles.closeButton}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="Close menu">
                <AppIcon name="close" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <ScrollView
              style={styles.navList}
              contentContainerStyle={styles.navListContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionLabel}>NAVIGATION</Text>
              {navItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={item.onPress}
                  style={[styles.navItem, item.active && styles.navItemActive]}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}>
                  <View
                    style={[
                      styles.navIconWrap,
                      item.active && styles.navIconWrapActive,
                    ]}>
                    <AppIcon
                      name={item.icon}
                      size={18}
                      color={item.active ? colors.primary : colors.textPrimary}
                    />
                  </View>
                  <View style={styles.navTextWrap}>
                    <Text
                      style={[
                        styles.navItemTitle,
                        item.active && styles.navItemTitleActive,
                      ]}>
                      {item.label}
                    </Text>
                    {item.subtitle ? (
                      <Text style={styles.navItemSubtitle} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <AppIcon
                    name="chevronRight"
                    size={14}
                    color={item.active ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <TouchableOpacity
                onPress={() => handleClose(onAuthAction)}
                style={[
                  styles.authButton,
                  isGuest ? styles.authButtonSignIn : styles.authButtonSignOut,
                ]}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={isGuest ? 'Sign In' : 'Sign Out'}>
                <Text
                  style={[
                    styles.authButtonText,
                    isGuest
                      ? styles.authButtonTextSignIn
                      : styles.authButtonTextSignOut,
                  ]}>
                  {isGuest ? 'Sign In / Create Account' : 'Sign Out'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.brandFooter}>
                MyWalkMap • Every Step Has a Story.
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    backdropPress: {
      flex: 1,
    },
    drawer: {
      height: '100%',
      backgroundColor: colors.surface,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      ...SHADOWS.floating,
    },
    drawerSafe: {
      flex: 1,
    },
    drawerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.md,
      paddingBottom: SPACING.md,
      gap: SPACING.sm,
    },
    userRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    avatarRing: {
      width: 48,
      height: 48,
      borderRadius: 24,
      padding: 2,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 22,
    },
    avatarFallback: {
      flex: 1,
      borderRadius: 22,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.primary,
    },
    userMeta: {
      flex: 1,
    },
    userName: {
      ...TYPOGRAPHY.titleMedium,
      fontSize: 16,
      color: colors.textPrimary,
    },
    userSubtext: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderSubtle,
      marginHorizontal: SPACING.md,
    },
    navList: {
      flex: 1,
    },
    navListContent: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      gap: SPACING.xs,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      color: colors.textMuted,
      marginBottom: SPACING.xs,
      marginLeft: SPACING.xs,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm + 2,
      paddingHorizontal: SPACING.sm,
      borderRadius: RADII.lg,
      gap: SPACING.sm,
    },
    navItemActive: {
      backgroundColor: colors.secondarySoft,
      borderWidth: 1,
      borderColor: colors.primaryMuted,
    },
    navIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navIconWrapActive: {
      backgroundColor: colors.secondary,
    },
    navTextWrap: {
      flex: 1,
    },
    navItemTitle: {
      ...TYPOGRAPHY.label,
      fontSize: 14,
      color: colors.textPrimary,
    },
    navItemTitleActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    navItemSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    drawerFooter: {
      paddingHorizontal: SPACING.md,
      paddingTop: SPACING.sm,
      paddingBottom: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      gap: SPACING.sm,
    },
    authButton: {
      borderRadius: RADII.pill,
      paddingVertical: SPACING.sm + 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    authButtonSignIn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    authButtonSignOut: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
    },
    authButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
    authButtonTextSignIn: {
      color: colors.textOnPrimary,
    },
    authButtonTextSignOut: {
      color: colors.textPrimary,
    },
    brandFooter: {
      textAlign: 'center',
      fontSize: 11,
      color: colors.textMuted,
    },
  });

export default SideDrawer;
