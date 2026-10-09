import React, {useCallback, useMemo, useState} from 'react';
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
import {Camera, GeoJSONSource, Layer, Map, Marker} from '@maplibre/maplibre-react-native';

import {deleteWorkout, getWorkout, getWorkoutRoute} from '../services/WorkoutStorage';
import {StoredWorkout} from '../types/Workout';
import {GPSPoint} from '../utils/GPSUtils';

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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const [savedWorkout, savedRoute] = await Promise.all([getWorkout(workoutId), getWorkoutRoute(workoutId)]);

        if (isActive) {
          setWorkout(savedWorkout);
          setRoutePoints(savedRoute);
        }
      };

      load();

      return () => {
        isActive = false;
      };
    }, [workoutId]),
  );

  const routeCoordinates = useMemo(
    () => routePoints.map(point => [point.longitude, point.latitude]),
    [routePoints],
  );

  const routeData = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: routeCoordinates,
      },
    }),
    [routeCoordinates],
  );

  const initialCenter = useMemo(() => {
    if (routePoints.length === 0) {
      return [0, 0] as [number, number];
    }

    const first = routePoints[0];
    return [first.longitude, first.latitude] as [number, number];
  }, [routePoints]);

  const deleteWorkoutEntry = () => {
    Alert.alert('Delete Workout?', 'This will remove the workout from your history and route data.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(workoutId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Workout details are unavailable.</Text>
      </SafeAreaView>
    );
  }

  const startPoint = routePoints[0];
  const endPoint = routePoints[routePoints.length - 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{workout.workoutType}</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryType}>{workout.workoutType === 'Walk' ? '🚶 Walk' : '🏃 Run'}</Text>
          <Text style={styles.summaryDistance}>{(workout.distance / 1000).toFixed(2)} km</Text>
          <Text style={styles.summaryDate}>{formatDate(workout.finishedAt)}</Text>
        </View>

        {routePoints.length > 1 && (
          <View style={styles.mapCard}>
            <Map style={styles.map} mapStyle="https://tiles.openfreemap.org/styles/liberty">
              <Camera
                initialViewState={{
                  center: initialCenter,
                  zoom: 15,
                }}
              />

              {routeCoordinates.length >= 2 && (
                <GeoJSONSource id="workout-detail-route" data={routeData}>
                  <Layer
                    id="workout-detail-line"
                    type="line"
                    paint={{
                      'line-color': '#2196F3',
                      'line-width': 5,
                      'line-opacity': 0.9,
                    }}
                  />
                </GeoJSONSource>
              )}

              {startPoint && (
                <Marker id="start-marker" anchor="center" lngLat={[startPoint.longitude, startPoint.latitude]}>
                  <View style={styles.startMarker} />
                </Marker>
              )}

              {endPoint && (
                <Marker id="end-marker" anchor="center" lngLat={[endPoint.longitude, endPoint.latitude]}>
                  <View style={styles.finishMarker} />
                </Marker>
              )}
            </Map>
          </View>
        )}

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Date</Text>
            <Text style={styles.statValue}>{new Date(workout.startedAt).toLocaleDateString()}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Start</Text>
            <Text style={styles.statValue}>{new Date(workout.startedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>End</Text>
            <Text style={styles.statValue}>{new Date(workout.finishedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{(workout.distance / 1000).toFixed(2)} km</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatDuration(workout.elapsedTime)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pace</Text>
            <Text style={styles.statValue}>{formatPace(workout.averagePace ?? workout.paceSecondsPerKm ?? null)}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{workout.calories ?? '—'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Elevation</Text>
            <Text style={styles.statValue}>{workout.elevationGain != null ? `${workout.elevationGain} m` : '—'}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>GPS Points</Text>
            <Text style={styles.statValue}>{workout.gpsPointCount}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={deleteWorkoutEntry}>
          <Text style={styles.deleteText}>Delete Workout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  summaryType: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDistance: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
    color: '#111111',
  },
  summaryDate: {
    marginTop: 4,
    fontSize: 13,
    color: '#666666',
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  map: {
    height: 220,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9EEF5',
  },
  statLabel: {
    fontSize: 11,
    color: '#777777',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111111',
  },
  deleteButton: {
    backgroundColor: '#D93025',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  startMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  finishMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D93025',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default WorkoutDetailScreen;
