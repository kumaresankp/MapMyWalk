import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS, SPACING, TYPOGRAPHY} from '../theme/theme';
import AppIcon from './AppIcon';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/**
 * Consistent section title bar with an optional inline navigation link.
 */
const SectionHeader = ({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <AppIcon name="chevronRight" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.sectionTitle,
    color: COLORS.textPrimary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingLeft: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SectionHeader;
