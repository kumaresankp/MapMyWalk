import React, {useRef} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';

import {WorkoutType} from '../types/Workout';
import {COLORS, RADII, SHADOWS, SPACING} from '../theme/theme';
import AppIcon from './AppIcon';

type WorkoutTypeSelectorProps = {
  value: WorkoutType;
  onChange: (type: WorkoutType) => void;
};

const OPTIONS: {
  type: WorkoutType;
  title: string;
  subtitle: string;
  icon: 'walk' | 'run';
  accent: string;
}[] = [
  {
    type: 'Walk',
    title: 'Walk',
    subtitle: 'Steady outdoor pace',
    icon: 'walk',
    accent: COLORS.primary,
  },
  {
    type: 'Run',
    title: 'Run',
    subtitle: 'High-tempo cardio',
    icon: 'run',
    accent: COLORS.coral,
  },
];

type TypeCardProps = {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
};

const TypeCard = ({option, selected, onSelect}: TypeCardProps) => {
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
              color={selected ? COLORS.textOnPrimary : COLORS.textPrimary}
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
              <AppIcon name="check" size={11} color={COLORS.textOnPrimary} />
            ) : null}
          </View>
        </View>

        <Text style={styles.cardTitle}>{option.title}</Text>
        <Text
          style={[
            styles.cardSubtitle,
            selected && {color: COLORS.textPrimary},
          ]}
          numberOfLines={1}>
          {option.subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Reference-inspired dark pill-card selector for Walk and Run.
 */
const WorkoutTypeSelector = ({value, onChange}: WorkoutTypeSelectorProps) => {
  return (
    <View style={styles.row}>
      {OPTIONS.map(option => (
        <TypeCard
          key={option.type}
          option={option}
          selected={value === option.type}
          onSelect={() => onChange(option.type)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.surfaceElevated,
  },
  cardUnselected: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default WorkoutTypeSelector;
