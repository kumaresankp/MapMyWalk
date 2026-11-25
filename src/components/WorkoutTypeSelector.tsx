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
}[] = [
  {
    type: 'Walk',
    title: 'Walk',
    subtitle: 'Steady outdoor pace',
    icon: 'walk',
  },
  {
    type: 'Run',
    title: 'Run',
    subtitle: 'High-tempo cardio',
    icon: 'run',
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
          selected ? styles.cardSelected : styles.cardUnselected,
        ]}>
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.iconCircle,
              selected ? styles.iconCircleSelected : styles.iconCircleUnselected,
            ]}>
            <AppIcon
              name={option.icon}
              size={22}
              color={selected ? COLORS.textOnPrimary : COLORS.primary}
            />
          </View>

          <View
            style={[
              styles.radioOuter,
              selected ? styles.radioOuterSelected : styles.radioOuterUnselected,
            ]}>
            {selected ? <AppIcon name="check" size={11} color={COLORS.secondary} /> : null}
          </View>
        </View>

        <Text
          style={[
            styles.cardTitle,
            selected && styles.cardTitleSelected,
          ]}>
          {option.title}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            selected && styles.cardSubtitleSelected,
          ]}
          numberOfLines={1}>
          {option.subtitle}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

/**
 * Dual athletic card selector for choosing between Walk and Run.
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
    minHeight: 118,
    justifyContent: 'space-between',
    ...SHADOWS.card,
  },
  cardSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
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
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  iconCircleUnselected: {
    backgroundColor: COLORS.primarySoft,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    backgroundColor: COLORS.accent,
  },
  radioOuterUnselected: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardTitleSelected: {
    color: COLORS.textOnPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardSubtitleSelected: {
    color: COLORS.primaryMuted,
  },
});

export default WorkoutTypeSelector;
