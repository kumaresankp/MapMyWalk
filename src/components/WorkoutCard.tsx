import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {StoredWorkout} from '../types/Workout';
import {formatDuration, formatPace} from '../theme/formatters';
import {COLORS, RADII, SHADOWS, SPACING} from '../theme/theme';
import AppIcon from './AppIcon';

type WorkoutCardProps = {
  workout: StoredWorkout;
  onPress: () => void;
  showPace?: boolean;
};

/**
 * Polished workout summary card used in Recent Workouts and Workout History.
 */
const WorkoutCard = ({
  workout,
  onPress,
  showPace = true,
}: WorkoutCardProps) => {
  const isRun = workout.workoutType === 'Run';
  const accentColor = isRun ? COLORS.primary : COLORS.accent;
  const badgeBg = isRun ? COLORS.primarySoft : COLORS.accentSoft;
  const iconColor = isRun ? COLORS.primary : COLORS.secondary;

  const paceValue = formatPace(
    workout.averagePace ?? workout.paceSecondsPerKm ?? null,
  );

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.78}
      accessibilityRole="button"
      accessibilityLabel={`${workout.workoutType} workout, ${(workout.distance / 1000).toFixed(2)} kilometers`}>
      <View style={styles.topRow}>
        <View style={styles.leftIdentity}>
          <View style={[styles.typeBadge, {backgroundColor: badgeBg}]}>
            <AppIcon
              name={isRun ? 'run' : 'walk'}
              size={20}
              color={iconColor}
            />
          </View>

          <View>
            <View style={styles.titleRow}>
              <Text style={styles.typeTitle}>{workout.workoutType}</Text>
              <View style={[styles.dotAccent, {backgroundColor: accentColor}]} />
            </View>
            <Text style={styles.dateText}>
              {new Date(workout.finishedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' • '}
              {new Date(workout.finishedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.chevronWrap}>
          <AppIcon name="chevronRight" size={16} color={COLORS.textMuted} />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {(workout.distance / 1000).toFixed(2)}
            <Text style={styles.metricUnit}> km</Text>
          </Text>
          <Text style={styles.metricLabel}>Distance</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {formatDuration(workout.elapsedTime)}
          </Text>
          <Text style={styles.metricLabel}>Duration</Text>
        </View>

        {showPace ? (
          <>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {paceValue}
                {paceValue !== '—' ? (
                  <Text style={styles.metricUnit}> /km</Text>
                ) : null}
              </Text>
              <Text style={styles.metricLabel}>Avg Pace</Text>
            </View>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  leftIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  typeBadge: {
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dotAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
});

export default WorkoutCard;
