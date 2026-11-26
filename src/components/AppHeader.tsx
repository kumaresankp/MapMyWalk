import React, {useMemo} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
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
  onMenuPress?: () => void;
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
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (props.variant === 'brand') {
    const initials = props.profileInitials || 'MW';
    return (
      <View style={styles.brandContainer}>
        <View style={styles.brandLeft}>
          {props.onMenuPress ? (
            <TouchableOpacity
              onPress={props.onMenuPress}
              style={styles.circleActionButton}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open Navigation Menu">
              <AppIcon name="menu" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : null}

          <View style={styles.brandTextGroup}>
            <Text style={styles.greetingTitle} numberOfLines={1}>
              {props.greeting || 'MyWalkMap'}
            </Text>
            <Text style={styles.tagline} numberOfLines={1}>
              {props.subtitle || 'Every Step Has a Story.'}
            </Text>
          </View>
        </View>

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
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}

          {props.onProfilePress && (
            <TouchableOpacity
              onPress={props.onProfilePress}
              style={styles.avatarRing}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Open Profile">
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
            <AppIcon name="back" size={20} color={colors.textPrimary} />
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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
      width: 44,
      height: 44,
      borderRadius: 22,
      padding: 2,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      ...SHADOWS.card,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    avatarFallback: {
      flex: 1,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitials: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.primary,
    },
    brandTextGroup: {
      flex: 1,
    },
    greetingTitle: {
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: colors.textPrimary,
    },
    tagline: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
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
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      minHeight: 60,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
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
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
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
      color: colors.textPrimary,
    },
    navSubtitle: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginTop: 1,
    },
  });

export default AppHeader;
