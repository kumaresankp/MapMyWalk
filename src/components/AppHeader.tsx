import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type BrandHeaderProps = {
  variant: 'brand';
  rightActionIcon?: AppIconName;
  rightActionLabel?: string;
  onRightActionPress?: () => void;
  profileInitials?: string;
  onProfilePress?: () => void;
};

type NavHeaderProps = {
  variant?: 'nav';
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  dark?: boolean;
};

type AppHeaderProps = BrandHeaderProps | NavHeaderProps;

/**
 * Unified top header supporting both the Home brand banner and sub-screen navigation bars.
 */
const AppHeader = (props: AppHeaderProps) => {
  if (props.variant === 'brand') {
    return (
      <View style={styles.brandContainer}>
        <View style={styles.brandLeft}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/logo 512x512.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.brandTextGroup}>
            <Text style={styles.brandName}>MyWalkMap</Text>
            <Text style={styles.tagline}>Every Step Has a Story.</Text>
          </View>
        </View>

        <View style={styles.brandRightActions}>
          {props.onRightActionPress && (
            <TouchableOpacity
              onPress={props.onRightActionPress}
              style={styles.brandActionButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={props.rightActionLabel ?? 'Privacy and Data'}>
              <AppIcon
                name={props.rightActionIcon ?? 'shield'}
                size={18}
                color={COLORS.secondary}
              />
            </TouchableOpacity>
          )}

          {props.onProfilePress && (
            <TouchableOpacity
              onPress={props.onProfilePress}
              style={styles.profilePillButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open Profile">
              <Text style={styles.profilePillText}>
                {props.profileInitials || 'GU'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const {title, subtitle, onBackPress, rightElement, dark = false} = props;

  return (
    <View
      style={[
        styles.navContainer,
        dark ? styles.navContainerDark : styles.navContainerLight,
      ]}>
      <View style={styles.navLeft}>
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={[
              styles.backButton,
              dark ? styles.backButtonDark : styles.backButtonLight,
            ]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <AppIcon
              name="back"
              size={20}
              color={dark ? COLORS.textOnPrimary : COLORS.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>

      <View style={styles.navCenter}>
        <Text
          style={[
            styles.navTitle,
            dark && styles.navTitleDark,
          ]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.navSubtitle,
              dark && styles.navSubtitleDark,
            ]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.navRight}>
        {rightElement ?? <View style={styles.navPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  logoFrame: {
    width: 46,
    height: 46,
    borderRadius: RADII.md,
    overflow: 'hidden',
    backgroundColor: COLORS.secondary,
    ...SHADOWS.card,
  },
  logoImage: {
    width: 46,
    height: 46,
  },
  brandTextGroup: {
    flex: 1,
  },
  brandName: {
    ...TYPOGRAPHY.titleLarge,
    fontSize: 24,
    color: COLORS.secondary,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  brandRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  brandActionButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  profilePillButton: {
    width: 42,
    height: 42,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.card,
  },
  profilePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
  },
  navContainerLight: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  navContainerDark: {
    backgroundColor: COLORS.secondary,
  },
  navLeft: {
    minWidth: 44,
    alignItems: 'flex-start',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  navRight: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonLight: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  backButtonDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  navPlaceholder: {
    width: 40,
    height: 40,
  },
  navTitle: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  navTitleDark: {
    color: COLORS.textOnPrimary,
  },
  navSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  navSubtitleDark: {
    color: COLORS.accent,
  },
});

export default AppHeader;
