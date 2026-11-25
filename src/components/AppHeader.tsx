import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type BrandHeaderProps = {
  variant: 'brand';
  greeting?: string;
  subtitle?: string;
  avatarUrl?: string | null;
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
 * Reference-inspired dark header with greeting/avatar on Home and circular back/action pills on sub-screens.
 */
const AppHeader = (props: AppHeaderProps) => {
  if (props.variant === 'brand') {
    const initials = props.profileInitials || 'MW';
    return (
      <View style={styles.brandContainer}>
        <TouchableOpacity
          onPress={props.onProfilePress}
          style={styles.brandLeft}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open Profile">
          <View style={styles.avatarRing}>
            {props.avatarUrl ? (
              <Image
                source={{uri: props.avatarUrl}}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <View style={styles.brandTextGroup}>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              {props.greeting || 'MyWalkMap'}
            </Text>
            <Text style={styles.tagline} numberOfLines={1}>
              {props.subtitle || 'Every Step Has a Story.'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.brandRightActions}>
          {props.onRightActionPress && (
            <TouchableOpacity
              onPress={props.onRightActionPress}
              style={styles.circleActionButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={props.rightActionLabel ?? 'Privacy and Data'}>
              <AppIcon
                name={props.rightActionIcon ?? 'shield'}
                size={18}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
          )}

          {props.onProfilePress && (
            <TouchableOpacity
              onPress={props.onProfilePress}
              style={styles.circleProfileButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open Profile">
              <Text style={styles.profilePillText}>{initials}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const {title, subtitle, onBackPress, rightElement} = props;

  return (
    <View style={styles.navContainer}>
      <View style={styles.navLeft}>
        {onBackPress ? (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <AppIcon name="back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>

      <View style={styles.navCenter}>
        <Text style={styles.navTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.navSubtitle} numberOfLines={1}>
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
    paddingBottom: SPACING.md,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    ...SHADOWS.card,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarFallback: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  brandTextGroup: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: COLORS.textPrimary,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  brandRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  circleActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleProfileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 60,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
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
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  navSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});

export default AppHeader;
