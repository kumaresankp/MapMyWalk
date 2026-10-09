import React, {useCallback, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {getWorkouts} from '../services/WorkoutStorage';
import {StoredWorkout} from '../types/Workout';

type Props = {
  navigation: any;
};

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatPace = (paceSecondsPerKm: number | null): string => {
  if (!paceSecondsPerKm || paceSecondsPerKm <= 0) {
    return '—';
  }

  const totalSeconds = Math.round(paceSecondsPerKm);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const HistoryItem = ({
  workout,
  onPress,
}: {
  workout: StoredWorkout;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.cardHeader}>
      <Text style={styles.typeText}>{workout.workoutType === 'Walk' ? '🚶 Walk' : '🏃 Run'}</Text>
      <Text style={styles.dateText}>{new Date(workout.finishedAt).toLocaleDateString()}</Text>
    </View>

    <View style={styles.statRow}>
      <View style={styles.statBlock}>
        <Text style={styles.valueText}>{(workout.distance / 1000).toFixed(2)} km</Text>
        <Text style={styles.labelText}>Distance</Text>
      </View>

      <View style={styles.statBlock}>
        <Text style={styles.valueText}>{formatDuration(workout.elapsedTime)}</Text>
        <Text style={styles.labelText}>Time</Text>
      </View>

      <View style={styles.statBlock}>
        <Text style={styles.valueText}>{formatPace(workout.averagePace ?? workout.paceSecondsPerKm ?? null)}</Text>
        <Text style={styles.labelText}>Pace</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const WorkoutHistoryScreen = ({navigation}: Props) => {
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        try {
          const saved = await getWorkouts();
          if (isActive) {
            setWorkouts(saved);
          }
        } catch (error) {
          Alert.alert('Storage Error', 'Unable to load saved workouts.');
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Workout History</Text>

        <View style={styles.headerSpacer} />
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📈</Text>
          <Text style={styles.emptyTitle}>No workouts saved yet</Text>
          <Text style={styles.emptyText}>Complete a walk or run to see your history here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {workouts.map(workout => (
            <HistoryItem
              key={workout.id}
              workout={workout}
              onPress={() => navigation.navigate('WorkoutDetail', {workoutId: workout.id})}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E7ECF2',
  },
  backButton: {
    fontSize: 36,
    color: '#1D1D1D',
    lineHeight: 36,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111111',
  },
  headerSpacer: {
    width: 28,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  dateText: {
    color: '#666666',
    fontSize: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  labelText: {
    marginTop: 4,
    fontSize: 11,
    color: '#777777',
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 21,
  },
});

export default WorkoutHistoryScreen;
