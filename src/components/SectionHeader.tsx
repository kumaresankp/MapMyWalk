import React, {useMemo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import AppIcon from './AppIcon';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

/**
 * Consistent section title bar with an optional inline primary action link.
 */
const SectionHeader = ({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
          <AppIcon name="chevronRight" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    title: {
      ...TYPOGRAPHY.sectionTitle,
      color: colors.textPrimary,
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
      color: colors.primary,
    },
  });

export default SectionHeader;
