import React, {
  useCallback,
  useState,
} from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  StoredWorkout,
} from '../types/Workout';

import {
  getWorkouts,
} from '../services/WorkoutStorage';

type Props = {
  navigation: any;
};

const HomeScreen = ({
  navigation,
}: Props) => {
  const [workoutType, setWorkoutType] =
    useState<'Walk' | 'Run'>('Walk');

  const [workouts, setWorkouts] =
    useState<StoredWorkout[]>([]);

  /*
   * Load workouts whenever Home
   * becomes visible
   */
  useFocusEffect(
    useCallback(() => {
      const loadWorkouts =
        async () => {
          const saved =
            await getWorkouts();

          setWorkouts(saved);
        };

      loadWorkouts();
    }, []),
  );

  /*
   * Today's workouts
   */
  const todayStart = new Date();

  todayStart.setHours(
    0,
    0,
    0,
    0,
  );

  const todayWorkouts =
    workouts.filter(
      workout =>
        workout.finishedAt >=
        todayStart.getTime(),
    );

  /*
   * Today's distance
   */
  const todayDistance =
    todayWorkouts.reduce(
      (total, workout) =>
        total + workout.distance,
      0,
    );

  /*
   * Start workout
   */
  const startWorkout = () => {
    navigation.navigate(
      'Workout',
      {
        workoutType,
      },
    );
  };

  return (
    <SafeAreaView
      style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          GPS Fitness
        </Text>

        <Text style={styles.subtitle}>
          Track your walking & running
        </Text>
      </View>

      {/* Workout selection */}
      <View style={styles.selectionContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            workoutType === 'Walk' &&
              styles.selectedTypeButton,
          ]}
          onPress={() =>
            setWorkoutType('Walk')
          }>
          <Text
            style={[
              styles.typeText,
              workoutType === 'Walk' &&
                styles.selectedTypeText,
            ]}>
            🚶 Walk
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            workoutType === 'Run' &&
              styles.selectedTypeButton,
          ]}
          onPress={() =>
            setWorkoutType('Run')
          }>
          <Text
            style={[
              styles.typeText,
              workoutType === 'Run' &&
                styles.selectedTypeText,
            ]}>
            🏃 Run
          </Text>
        </TouchableOpacity>
      </View>

      {/* Start */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={startWorkout}>
        <Text style={styles.startButtonText}>
          Start {workoutType}
        </Text>
      </TouchableOpacity>

      {/* Today's stats */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>
          Today's Activity
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {(
                todayDistance / 1000
              ).toFixed(2)}
            </Text>

            <Text style={styles.statLabel}>
              KM
            </Text>
          </View>

          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {todayWorkouts.length}
            </Text>

            <Text style={styles.statLabel}>
              WORKOUTS
            </Text>
          </View>
        </View>
      </View>

      {/* Recent workouts */}
      <View style={styles.recentContainer}>
        <View
          style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>
            Recent Workouts
          </Text>

          <Text style={styles.countText}>
            {workouts.length}
          </Text>
        </View>

        {workouts.length === 0 ? (
          <View
            style={
              styles.emptyContainer
            }>
            <Text
              style={styles.emptyTitle}>
              No workouts yet
            </Text>

            <Text
              style={styles.emptyText}>
              Complete your first workout
              to see it here.
            </Text>
          </View>
        ) : (
          workouts
            .slice(0, 3)
            .map(workout => (
              <View
                key={workout.id}
                style={styles.workoutCard}>

                <View>
                  <Text
                    style={
                      styles.workoutType
                    }>
                    {workout.workoutType ===
                    'Walk'
                      ? '🚶 Walk'
                      : '🏃 Run'}
                  </Text>

                  <Text
                    style={
                      styles.workoutDate
                    }>
                    {new Date(
                      workout.finishedAt,
                    ).toLocaleDateString()}
                  </Text>
                </View>

                <View
                  style={
                    styles.workoutRight
                  }>
                  <Text
                    style={
                      styles.workoutDistance
                    }>
                    {(
                      workout.distance /
                      1000
                    ).toFixed(2)}{' '}
                    km
                  </Text>

                  <Text
                    style={
                      styles.workoutTime
                    }>
                    {Math.floor(
                      workout.elapsedTime /
                        60,
                    )}{' '}
                    min
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 20,
  },

  header: {
    paddingTop: 25,
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111111',
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: '#777777',
  },

  selectionContainer: {
    flexDirection: 'row',
    gap: 12,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectedTypeButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  typeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555555',
  },

  selectedTypeText: {
    color: '#FFFFFF',
  },

  startButton: {
    marginTop: 18,
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 27,
    fontWeight: '800',
    color: '#111111',
  },

  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
  },

  recentContainer: {
    flex: 1,
    marginTop: 25,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  countText: {
    fontSize: 13,
    color: '#777777',
  },

  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
  },

  workoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  workoutType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222222',
  },

  workoutDate: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },

  workoutRight: {
    alignItems: 'flex-end',
  },

  workoutDistance: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111111',
  },

  workoutTime: {
    fontSize: 12,
    color: '#888888',
    marginTop: 3,
  },
});

export default HomeScreen;