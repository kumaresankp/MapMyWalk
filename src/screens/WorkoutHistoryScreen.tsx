import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {AppHeader, EmptyState, WorkoutCard} from '../components';
import {getWorkouts} from '../services/WorkoutStorage';
import {formatDuration} from '../theme/formatters';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
import {StoredWorkout} from '../types/Workout';

type Props = {
  navigation: any;
};

type FilterType = 'All' | 'Walk' | 'Run';

const FILTERS: FilterType[] = ['All', 'Walk', 'Run'];

const WorkoutHistoryScreen = ({navigation}: Props) => {
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        try {
          const saved = await getWorkouts();
          if (isActive) {
            setWorkouts(saved);
            setIsLoading(false);
          }
        } catch {
          if (isActive) {
            setIsLoading(false);
          }
          Alert.alert('Storage Error', 'Unable to load saved workouts.');
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const filteredWorkouts = useMemo(() => {
    if (filter === 'All') {
      return workouts;
    }
    return workouts.filter(workout => workout.workoutType === filter);
  }, [workouts, filter]);

  const totals = useMemo(() => {
    return filteredWorkouts.reduce(
      (acc, item) => ({
        distance: acc.distance + item.distance,
        duration: acc.duration + item.elapsedTime,
      }),
      {distance: 0, duration: 0},
    );
  }, [filteredWorkouts]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <AppHeader
        title="Workout History"
        subtitle={
          workouts.length > 0
            ? `${workouts.length} recorded ${workouts.length === 1 ? 'session' : 'sessions'}`
            : undefined
        }
        onBackPress={() => navigation.goBack()}
      />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingLabel}>Loading workout history…</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="history"
            title="No workouts saved yet"
            description="Complete a walk or run to build your personal activity log and route history."
            actionLabel="Start a Workout"
            onActionPress={() => navigation.goBack()}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Filter Tabs */}
          <View style={styles.filterBar}>
            {FILTERS.map(item => {
              const active = filter === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}
                  style={[
                    styles.filterPill,
                    active && styles.filterPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.filterTextActive,
                    ]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Totals Summary Strip */}
          <View style={styles.summaryStrip}>
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue}>{filteredWorkouts.length}</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue}>
                {(totals.distance / 1000).toFixed(2)} km
              </Text>
              <Text style={styles.summaryLabel}>Total Distance</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <Text style={styles.summaryValue}>
                {formatDuration(totals.duration)}
              </Text>
              <Text style={styles.summaryLabel}>Total Time</Text>
            </View>
          </View>

          {filteredWorkouts.length === 0 ? (
            <EmptyState
              icon={filter === 'Run' ? 'run' : 'walk'}
              title={`No ${filter.toLowerCase()} workouts yet`}
              description={`You haven't recorded any ${filter.toLowerCase()} sessions yet. Switch filters or start a new ${filter.toLowerCase()}.`}
              actionLabel="Show All Workouts"
              onActionPress={() => setFilter('All')}
            />
          ) : (
            filteredWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() =>
                  navigation.navigate('WorkoutDetail', {workoutId: workout.id})
                }
              />
            ))
          )}
        </ScrollView>
      )}
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
  loadingLabel: {
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
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.md,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: COLORS.secondary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textOnPrimary,
  },
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: RADII.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textOnPrimary,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});

export default WorkoutHistoryScreen;
