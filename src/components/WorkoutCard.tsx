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
 * Reference-styled dark activity card with circular glowing activity icon and tabular metrics.
 */
const WorkoutCard = ({
  workout,
  onPress,
  showPace = true,
}: WorkoutCardProps) => {
  const isRun = workout.workoutType === 'Run';
  const accentColor = isRun ? COLORS.coral : COLORS.primary;
  const ringBg = isRun ? COLORS.coralSoft : COLORS.primarySoft;

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
          <View
            style={[
              styles.typeCircle,
              {backgroundColor: ringBg, borderColor: accentColor},
            ]}>
            <AppIcon
              name={isRun ? 'run' : 'walk'}
              size={20}
              color={accentColor}
            />
          </View>

          <View style={styles.identityText}>
            <Text style={styles.typeTitle}>{workout.workoutType}</Text>
            <Text style={styles.dateText} numberOfLines={1}>
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

        <View style={styles.rightHero}>
          <Text style={styles.heroDistance}>
            {(workout.distance / 1000).toFixed(2)}
          </Text>
          <Text style={styles.heroUnit}>/km</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
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

        <View style={styles.divider} />
        <View style={styles.detailsPill}>
          <Text style={styles.detailsText}>Details</Text>
          <AppIcon name="chevronRight" size={13} color={COLORS.primary} />
        </View>
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
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  leftIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  typeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightHero: {
    alignItems: 'flex-end',
  },
  heroDistance: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
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
    height: 22,
    backgroundColor: COLORS.border,
  },
  detailsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default WorkoutCard;
