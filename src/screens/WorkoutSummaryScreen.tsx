import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {GPSPoint} from '../utils/GPSUtils';

type WorkoutSummaryScreenProps = {
  route: {
    params: {
      workoutType: 'Walk' | 'Run';
      distance: number;
      elapsedTime: number;
      gpsPoints: GPSPoint[];
      calories?: number | null;
      elevationGain?: number | null;
      averagePace?: number | null;
    };
  };
  navigation: any;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatPace = (averagePace: number | null | undefined) => {
  if (!averagePace || averagePace <= 0) {
    return '—';
  }

  const totalSeconds = Math.round(averagePace);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const WorkoutSummaryScreen = ({route, navigation}: WorkoutSummaryScreenProps) => {
  const {workoutType, distance, elapsedTime, gpsPoints, calories, elevationGain, averagePace} = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.completed}>Workout Completed</Text>
          <Text style={styles.workoutType}>{workoutType}</Text>
        </View>

        <View style={styles.mainStats}>
          <Text style={styles.distanceValue}>{(distance / 1000).toFixed(2)}</Text>
          <Text style={styles.distanceLabel}>Kilometers</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatPace(averagePace)}</Text>
            <Text style={styles.statLabel}>Pace /km</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{calories ?? '—'}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{elevationGain != null ? `${elevationGain} m` : '—'}</Text>
            <Text style={styles.statLabel}>Elevation</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{gpsPoints.length}</Text>
            <Text style={styles.statLabel}>GPS points</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{workoutType}</Text>
            <Text style={styles.statLabel}>Workout</Text>
          </View>
        </View>

        <View style={styles.routeCard}>
          <Text style={styles.routeTitle}>Route Recorded</Text>
          <Text style={styles.routeText}>Your GPS path includes {gpsPoints.length} tracked points.</Text>
          <Text style={styles.routeText}>Calories are estimated and intended for personal fitness tracking.</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
  },
  checkmark: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 70,
  },
  completed: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
  },
  workoutType: {
    marginTop: 6,
    fontSize: 16,
    color: '#777777',
  },
  mainStats: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 25,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  distanceValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111111',
  },
  distanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
  },
  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  routeTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
    lineHeight: 20,
  },
  buttons: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WorkoutSummaryScreen;