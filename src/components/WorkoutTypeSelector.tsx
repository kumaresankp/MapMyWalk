import React, {useMemo, useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {WorkoutType} from '../types/Workout';
import {RADII, SHADOWS, SPACING, ThemeColors} from '../theme/theme';
import AppIcon from './AppIcon';

type WorkoutTypeSelectorProps = {
  value: WorkoutType;
  onChange: (type: WorkoutType) => void;
};

type TypeOption = {
  type: WorkoutType;
  title: string;
  subtitle: string;
  icon: 'walk' | 'run';
  accent: string;
};

type TypeCardProps = {
  option: TypeOption;
  selected: boolean;
  onSelect: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
};

const TypeCard = ({
  option,
  selected,
  onSelect,
  colors,
  styles,
}: TypeCardProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 42,
      bounciness: 5,
    }).start();
  };

  const activeColor = option.accent;

  return (
    <Animated.View style={[styles.cardWrapper, {transform: [{scale}]}]}>
      <Pressable
        onPress={onSelect}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityState={{selected}}
        accessibilityLabel={`${option.title} workout`}
        style={[
          styles.card,
          selected
            ? [styles.cardSelected, {borderColor: activeColor}]
            : styles.cardUnselected,
        ]}>
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.iconCircle,
              selected
                ? {backgroundColor: activeColor}
                : styles.iconCircleUnselected,
            ]}>
            <AppIcon
              name={option.icon}
              size={20}
              color={selected ? colors.textOnPrimary : colors.textPrimary}
            />
          </View>

          <View
            style={[
              styles.radioOuter,
              selected
                ? {backgroundColor: activeColor, borderColor: activeColor}
                : styles.radioOuterUnselected,
            ]}>
            {selected ? (
              <AppIcon name="check" size={11} color={colors.textOnPrimary} />
            ) : null}
          </View>
        </View>

        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text
          style={[
            styles.cardSubtitle,
            selected && {color: colors.textPrimary},
          ]}
          numberOfLines={1}>
          {option.subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Reference-inspired pill-card selector for Walk and Run.
 */
const WorkoutTypeSelector = ({value, onChange}: WorkoutTypeSelectorProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const options: TypeOption[] = useMemo(
    () => [
      {
        type: 'Walk',
        title: 'Walk',
        subtitle: 'Steady outdoor pace',
        icon: 'walk',
        accent: colors.primary,
      },
      {
        type: 'Run',
        title: 'Run',
        subtitle: 'High-tempo cardio',
        icon: 'run',
        accent: colors.coral,
      },
    ],
    [colors],
  );

  return (
    <View style={styles.row}>
      {options.map(option => (
        <TypeCard
          key={option.type}
          option={option}
          selected={value === option.type}
          onSelect={() => onChange(option.type)}
          colors={colors}
          styles={styles}
        />
      ))}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    cardWrapper: {
      flex: 1,
    },
    card: {
      borderRadius: RADII.lg,
      padding: SPACING.md,
      borderWidth: 1.5,
      minHeight: 112,
      justifyContent: 'space-between',
      ...SHADOWS.card,
    },
    cardSelected: {
      backgroundColor: colors.surfaceElevated,
    },
    cardUnselected: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.sm,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleUnselected: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
    },
    radioOuterUnselected: {
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    cardSubtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      marginTop: 2,
    },
  });

export default WorkoutTypeSelector;
