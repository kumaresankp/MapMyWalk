import React from 'react';
import {StyleProp, StyleSheet, Text, View, ViewStyle} from 'react-native';

import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
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
 * Reusable metric display card with optional icon badge and tabular numbers.
 */
const StatCard = ({
  label,
  value,
  unit,
  icon,
  accentColor = COLORS.primary,
  style,
  compact = false,
}: StatCardProps) => {
  return (
    <View style={[styles.card, compact && styles.cardCompact, style]}>
      <View style={styles.topRow}>
        {icon ? (
          <View
            style={[
              styles.iconBadge,
              {backgroundColor: `${accentColor}16`},
            ]}>
            <AppIcon name={icon} size={16} color={accentColor} />
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
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
    borderRadius: RADII.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
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
  },
  valueCompact: {
    fontSize: 18,
  },
  unit: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default StatCard;
