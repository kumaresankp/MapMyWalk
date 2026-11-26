import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {RADII, SPACING, ThemeColors, ThemeMode, TYPOGRAPHY} from '../theme/theme';

const OPTIONS: {value: ThemeMode; label: string}[] = [
  {value: 'dark', label: 'Dark'},
  {value: 'light', label: 'Light'},
  {value: 'system', label: 'System'},
];

/**
 * 3-option appearance selector (Dark / Light / System) for Profile settings.
 */
const ThemeSelector = () => {
  const {themeMode, resolvedTheme, colors, setThemeMode} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>App Theme</Text>
        <Text style={styles.badge}>
          {resolvedTheme === 'light' ? 'Light Active' : 'Dark Active'}
        </Text>
      </View>

      <View style={styles.segmentRow}>
        {OPTIONS.map(option => {
          const active = themeMode === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setThemeMode(option.value)}
              style={[styles.segment, active && styles.segmentActive]}
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              accessibilityLabel={`Theme ${option.label}`}>
              <Text
                style={[
                  styles.segmentText,
                  active && styles.segmentTextActive,
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
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
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    title: {
      ...TYPOGRAPHY.cardTitle,
      fontSize: 15,
      color: colors.textPrimary,
    },
    badge: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    segmentRow: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceElevated,
      borderRadius: RADII.md,
      padding: 4,
      gap: 4,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    segment: {
      flex: 1,
      paddingVertical: SPACING.xs + 2,
      borderRadius: RADII.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    segmentTextActive: {
      color: colors.textOnPrimary,
    },
  });

export default ThemeSelector;
