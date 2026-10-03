import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type GPSPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
};

type WorkoutSummaryScreenProps = {
  route: {
    params: {
      workoutType: 'Walk' | 'Run';
      distance: number;
      elapsedTime: number;
      gpsPoints: GPSPoint[];
    };
  };
  navigation: any;
};

const WorkoutSummaryScreen = ({
  route,
  navigation,
}: WorkoutSummaryScreenProps) => {
  const {
    workoutType,
    distance,
    elapsedTime,
    gpsPoints,
  } = route.params;

  /*
   * Format time
   */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60,
    );

    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours
        .toString()
        .padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    }

    return `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  /*
   * Calculate pace
   */
  const calculatePace = () => {
    if (distance <= 0) {
      return '--';
    }

    const distanceKm = distance / 1000;

    const totalMinutes = elapsedTime / 60;

    const pace = totalMinutes / distanceKm;

    if (!isFinite(pace)) {
      return '--';
    }

    const paceMinutes = Math.floor(pace);

    const paceSeconds = Math.floor(
      (pace - paceMinutes) * 60,
    );

    return `${paceMinutes}:${paceSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.checkmark}>✓</Text>

        <Text style={styles.completed}>
          Workout Completed
        </Text>

        <Text style={styles.workoutType}>
          {workoutType}
        </Text>
      </View>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <Text style={styles.distanceValue}>
          {(distance / 1000).toFixed(2)}
        </Text>

        <Text style={styles.distanceLabel}>
          KILOMETERS
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatTime(elapsedTime)}
          </Text>

          <Text style={styles.statLabel}>
            TIME
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {calculatePace()}
          </Text>

          <Text style={styles.statLabel}>
            PACE /KM
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {gpsPoints.length}
          </Text>

          <Text style={styles.statLabel}>
            GPS POINTS
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {workoutType}
          </Text>

          <Text style={styles.statLabel}>
            WORKOUT
          </Text>
        </View>
      </View>

      {/* Route information */}
      <View style={styles.routeCard}>
        <Text style={styles.routeTitle}>
          Route Recorded
        </Text>

        <Text style={styles.routeText}>
          Your GPS route contains {gpsPoints.length}{' '}
          recorded points.
        </Text>

        <Text style={styles.routeText}>
          GPS tracking completed successfully.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            navigation.popToTop();
          }}>
          <Text style={styles.primaryButtonText}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
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
    marginTop: 35,
    paddingVertical: 25,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
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
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
    alignItems: 'center',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 6,
  },

  routeCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 18,
    marginTop: 5,
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
  },

  buttons: {
    marginTop: 'auto',
    paddingBottom: 25,
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