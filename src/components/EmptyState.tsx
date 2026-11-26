import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {RADII, SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';
import PrimaryButton from './PrimaryButton';

type EmptyStateProps = {
  icon?: AppIconName;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  tone?: 'neutral' | 'error' | 'warning';
  style?: StyleProp<ViewStyle>;
};

/**
 * Polished placeholder card for empty lists, missing data, or recoverable error states.
 */
const EmptyState = ({
  icon = 'distance',
  title,
  description,
  actionLabel,
  onActionPress,
  tone = 'neutral',
  style,
}: EmptyStateProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const iconBg =
    tone === 'error'
      ? colors.errorSoft
      : tone === 'warning'
      ? colors.warningSoft
      : colors.primarySoft;

  const iconColor =
    tone === 'error'
      ? colors.error
      : tone === 'warning'
      ? colors.warning
      : colors.primary;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconWrap, {backgroundColor: iconBg}]}>
        <AppIcon name={icon} size={28} color={iconColor} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {actionLabel && onActionPress ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onActionPress}
          style={styles.button}
        />
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: RADII.lg,
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.card,
    },
    iconWrap: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: SPACING.md,
    },
    title: {
      ...TYPOGRAPHY.sectionTitle,
      textAlign: 'center',
      color: colors.textPrimary,
    },
    description: {
      ...TYPOGRAPHY.body,
      textAlign: 'center',
      color: colors.textSecondary,
      marginTop: SPACING.xs,
      maxWidth: 280,
    },
    button: {
      marginTop: SPACING.lg,
      alignSelf: 'stretch',
    },
  });

export default EmptyState;
