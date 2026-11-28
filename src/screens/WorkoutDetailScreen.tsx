import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {
  AppDialog,
  AppHeader,
  AppIcon,
  EmptyState,
  RouteMapPreview,
  SecondaryButton,
  SectionHeader,
  StatCard,
} from '../components';
import {
  deleteWorkout,
  getWorkout,
  getWorkoutRoute,
} from '../services/WorkoutStorage';
import {formatDuration, formatPace} from '../theme/formatters';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
import {StoredWorkout} from '../types/Workout';
import {GPSPoint} from '../utils/GPSUtils';

const formatDate = (value: number): string => new Date(value).toLocaleString();

type Props = {
  route: {
    params: {
      workoutId: string;
    };
  };
  navigation: any;
};

const WorkoutDetailScreen = ({route, navigation}: Props) => {
  const {workoutId} = route.params;
  const [workout, setWorkout] = useState<StoredWorkout | null>(null);
  const [routePoints, setRoutePoints] = useState<GPSPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const [savedWorkout, savedRoute] = await Promise.all([
          getWorkout(workoutId),
          getWorkoutRoute(workoutId),
        ]);

        if (isActive) {
          setWorkout(savedWorkout);
          setRoutePoints(savedRoute);
          setIsLoading(false);
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, [workoutId]),
  );

  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const deleteWorkoutEntry = () => {
    setDeleteDialogVisible(true);
  };

  const confirmDeleteWorkout = async () => {
    setDeleteDialogVisible(false);
    await deleteWorkout(workoutId);
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AppHeader
          title="Workout Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading workout details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <AppHeader
          title="Workout Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="alert"
            tone="warning"
            title="Workout details are unavailable"
            description="This workout may have been removed or could not be found on your device."
            actionLabel="Back to History"
            onActionPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const paceText = formatPace(
    workout.averagePace ?? workout.paceSecondsPerKm ?? null,
  );
  const isRun = workout.workoutType === 'Run';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AppHeader
        title={`${workout.workoutType} Details`}
        subtitle={new Date(workout.finishedAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Hero Overview Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.typeChip}>
              <AppIcon
                name={isRun ? 'run' : 'walk'}
                size={16}
                color={isRun ? COLORS.coral : COLORS.primary}
              />
              <Text style={styles.typeChipText}>{workout.workoutType}</Text>
            </View>
            <Text style={styles.heroDate}>{formatDate(workout.finishedAt)}</Text>
          </View>

          <View style={styles.heroMetricRow}>
            <Text style={styles.heroDistance}>
              {(workout.distance / 1000).toFixed(2)}
            </Text>
            <Text style={styles.heroUnit}>km</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Recorded Route" />
          <RouteMapPreview
            routePoints={routePoints}
            height={routePoints.length > 1 ? 240 : 160}
            sourceId="workout-detail-route"
            layerId="workout-detail-line"
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Workout Statistics" />

          <View style={styles.grid}>
            <StatCard
              label="Distance"
              value={(workout.distance / 1000).toFixed(2)}
              unit="km"
              icon="distance"
              accentColor={COLORS.primary}
              style={styles.gridItem}
              compact
            />

            <StatCard
              label="Duration"
              value={formatDuration(workout.elapsedTime)}
              icon="time"
              accentColor={COLORS.primary}
              style={styles.gridItem}
              compact
            />

            <StatCard
              label="Avg Pace"
              value={paceText}
              unit={paceText !== '—' ? '/km' : undefined}
              icon="pace"
              accentColor={COLORS.accent}
              style={styles.gridItem}
              compact
            />

            <StatCard
              label="Calories"
              value={workout.calories != null ? String(workout.calories) : '—'}
              unit={workout.calories != null ? 'kcal' : undefined}
              icon="calories"
              accentColor={COLORS.coral}
              style={styles.gridItem}
              compact
            />

            <StatCard
              label="Elevation"
              value={
                workout.elevationGain != null
                  ? String(workout.elevationGain)
                  : '—'
              }
              unit={workout.elevationGain != null ? 'm' : undefined}
              icon="elevation"
              accentColor={COLORS.accent}
              style={styles.gridItem}
              compact
            />

            <StatCard
              label="GPS Points"
              value={String(workout.gpsPointCount)}
              icon="gps"
              accentColor={COLORS.primary}
              style={styles.gridItem}
              compact
            />
          </View>
        </View>

        <View style={styles.timestampsCard}>
          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Date</Text>
            <Text style={styles.timestampValue}>
              {new Date(workout.startedAt).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.timestampDivider} />

          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>Start</Text>
            <Text style={styles.timestampValue}>
              {new Date(workout.startedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.timestampDivider} />

          <View style={styles.timestampRow}>
            <Text style={styles.timestampLabel}>End</Text>
            <Text style={styles.timestampValue}>
              {new Date(workout.finishedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <SecondaryButton
          label="Delete Workout"
          icon="trash"
          tone="danger"
          onPress={deleteWorkoutEntry}
          style={styles.deleteButton}
        />
      </ScrollView>

      <AppDialog
        visible={deleteDialogVisible}
        title="Delete Workout?"
        message="This will remove the workout from your history and route data."
        icon="trash"
        tone="danger"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={confirmDeleteWorkout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: COLORS.secondarySoft,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    ...SHADOWS.floating,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  heroDate: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
  },
  heroMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: SPACING.md,
  },
  heroDistance: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  section: {
    marginTop: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  gridItem: {
    width: '48.2%',
  },
  timestampsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  timestampLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timestampDivider: {
    height: 1,
    backgroundColor: COLORS.borderSubtle,
  },
  deleteButton: {
    marginTop: SPACING.xl,
  },
});

export default WorkoutDetailScreen;
