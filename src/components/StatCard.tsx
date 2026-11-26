import React, {useMemo} from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {RADII, SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type StatCardProps = {
  label: string;
  value: string;
  unit?: string;
  icon?: AppIconName;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

/**
 * Reference-styled metric card with colored top icon badge and bold tabular value.
 */
const StatCard = ({
  label,
  value,
  unit,
  icon,
  accentColor,
  style,
  compact = false,
}: StatCardProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedAccent = accentColor ?? colors.primary;

  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <View style={styles.topRow}>
        {icon ? (
          <View
            style={[
              styles.iconBadge,
              {backgroundColor: `${resolvedAccent}22`},
            ]}>
            <AppIcon name={icon} size={15} color={resolvedAccent} />
          </View>
        ) : null}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>

      <View style={styles.valueRow}>
        <Text
          style={[styles.value, compact && styles.valueCompact]}
          numberOfLines={1}
          adjustsFontSizeToFit>
          {value}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADII.lg,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.card,
    },
    cardCompact: {
      padding: SPACING.sm,
      borderRadius: RADII.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    iconBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      ...TYPOGRAPHY.overline,
      color: colors.textSecondary,
      flex: 1,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    value: {
      ...TYPOGRAPHY.statValue,
      fontSize: 22,
      color: colors.textPrimary,
    },
    valueCompact: {
      fontSize: 18,
    },
    unit: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
  });

export default StatCard;
