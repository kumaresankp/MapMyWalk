import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import {
  saveWorkout,
} from '../services/WorkoutStorage';

import {
  StoredWorkout,
} from '../types/Workout';

import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  Marker,
} from '@maplibre/maplibre-react-native';

import Geolocation, {
  type GeolocationResponse,
} from '@react-native-community/geolocation';

import {
  GPSPoint,
  calculateDistance,
  isValidGPSPoint,
} from '../utils/GPSUtils';
import {estimateCalories} from '../utils/CalorieUtils';
import {calculateElevationGain} from '../utils/ElevationUtils';

type WorkoutScreenProps = {
  route: {
    params: {
      workoutType: 'Walk' | 'Run';
    };
  };
  navigation: any;
};

const WorkoutScreen = ({
  route,
  navigation,
}: WorkoutScreenProps) => {
  const {workoutType} = route.params;

  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<GPSPoint | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);
  const isPausedRef = useRef(false);
  const startedAtRef = useRef<number>(
      Date.now(),
    );
  const cameraRef = useRef<any>(null);

  /*
   * Keep pause state available inside GPS callback
   */
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  /*
   * Android location permission
   */
  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'This app needs your location to track your workout.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    console.log('LOCATION PERMISSION:', granted);

    return (
      granted === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  /*
   * Convert native position to our GPSPoint
   */
  const createGPSPoint = (
    position: GeolocationResponse,
  ): GPSPoint => {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
      altitude:
        position.coords.altitude ?? null,
      speed:
        position.coords.speed ?? null,
    };
  };

  /*
   * Process GPS position
   */
  const processGPSPosition = (
    position: GeolocationResponse,
  ) => {
    console.log(
      'GPS SUCCESS:',
      position.coords.latitude,
      position.coords.longitude,
      'accuracy:',
      position.coords.accuracy,
    );

    if (isPausedRef.current) {
      console.log('GPS ignored because workout is paused');
      return;
    }

    const newPoint = createGPSPoint(position);

    /*
     * First point
     */
    if (!lastPointRef.current) {
      console.log('FIRST GPS POINT');

      lastPointRef.current = newPoint;

      setGpsPoints([newPoint]);
      setCurrentLocation(newPoint);

      return;
    }

    const previousPoint = lastPointRef.current;

    /*
     * Validate GPS point
     */
    const valid = isValidGPSPoint(
      previousPoint,
      newPoint,
    );

    if (!valid) {
      console.log('GPS POINT REJECTED');

      return;
    }

    /*
     * Calculate distance
     */
    const segmentDistance = calculateDistance(
      previousPoint,
      newPoint,
    );

    console.log(
      'GPS DISTANCE:',
      segmentDistance,
      'meters',
    );

    /*
     * Update last point
     */
    lastPointRef.current = newPoint;

    /*
     * Add point
     */
    setGpsPoints(previous => [
      ...previous,
      newPoint,
    ]);

    /*
     * Add distance
     */
    setDistance(previous => {
      return previous + segmentDistance;
    });

    /*
     * Update location
     */
    setCurrentLocation(newPoint);
  };

  /*
   * Start workout
   */
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null =
      null;

    const startWorkout = async () => {
      /*
       * Configure Android location provider
       */
      Geolocation.setRNConfiguration({
        skipPermissionRequests: true,
        locationProvider: 'android',
      });

      console.log('Geolocation configured');

      /*
       * Permission
       */
      const permission =
        await requestLocationPermission();

      if (!permission) {
        Alert.alert(
          'Location Permission Required',
          'Please allow location permission to track your workout.',
        );

        navigation.goBack();

        return;
      }

      /*
       * Timer
       */
      timer = setInterval(() => {
        if (!isPausedRef.current) {
          setElapsedTime(previous => previous + 1);
        }
      }, 1000);

      /*
       * Get immediate location
       */
      console.log('REQUESTING CURRENT LOCATION...');

      Geolocation.getCurrentPosition(
        position => {
          console.log(
            'INITIAL LOCATION:',
            position.coords.latitude,
            position.coords.longitude,
          );

          processGPSPosition(position);

          // Get a fresh high-accuracy position afterward
          Geolocation.getCurrentPosition(
            freshPosition => {
              console.log(
                'FRESH HIGH ACCURACY LOCATION:',
                freshPosition.coords.latitude,
                freshPosition.coords.longitude,
              );

              processGPSPosition(freshPosition);
            },
            error => {
              console.log(
                'HIGH ACCURACY ERROR:',
                error.code,
                error.message,
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 5000,
            },
          );
        },
        error => {
          console.log(
            'INITIAL LOCATION ERROR:',
            error.code,
            error.message,
          );
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000,
        },
      );

      /*
       * Start continuous GPS tracking
       */
      console.log('STARTING GPS WATCH...');

      const id = Geolocation.watchPosition(
        position => {
          processGPSPosition(position);
        },
        error => {
          console.log(
            'WATCH LOCATION ERROR:',
            error.code,
            error.message,
          );
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 3,
          interval: 2000,
          fastestInterval: 1000,
          timeout: 15000,
          maximumAge: 1000,
        },
      );

      watchIdRef.current = id;

      console.log(
        'GPS WATCH STARTED:',
        id,
      );
    };

    startWorkout();

    /*
     * Cleanup
     */
    return () => {
      if (timer) {
        clearInterval(timer);
      }

      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(
          watchIdRef.current,
        );

        watchIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
  if (
    gpsPoints.length === 0 ||
    !currentLocation ||
    !cameraRef.current
  ) {
    return;
  }

  const currentIndex =
    gpsPoints.length - 1;

  let bearing = 0;

  if (currentIndex > 0) {
    const previousPoint =
      gpsPoints[currentIndex - 1];

    const currentPoint =
      gpsPoints[currentIndex];

    bearing = calculateBearing(
      previousPoint,
      currentPoint,
    );
  }

  cameraRef.current.easeTo({
    center: [
      currentLocation.longitude,
      currentLocation.latitude,
    ],
    zoom: 17,
    bearing,
    duration: 700,
  });
}, [currentLocation, gpsPoints]);

  /*
   * Format time
   */
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60,
    );

    const remainingSeconds = seconds % 60;

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0'),
    ].join(':');
  };

  /*
   * Pace
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
      .padStart(2, '0')} /km`;
  };

  /*
   * Route coordinates
   */
  const routeCoordinates = useMemo(() => {
    return gpsPoints.map(point => [
      point.longitude,
      point.latitude,
    ]);
  }, [gpsPoints]);

  /*
   * GeoJSON
   */
  const routeGeoJSON = useMemo(() => {
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: routeCoordinates,
      },
    };
  }, [routeCoordinates]);

  /*
   * Finish
   */
  const finishWorkout = () => {
  Alert.alert(
    'Finish Workout?',
    'Are you sure you want to finish this workout?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Finish',
        onPress: async () => {
          try {
            /*
             * Stop GPS
             */
            if (watchIdRef.current !== null) {
              Geolocation.clearWatch(
                watchIdRef.current,
              );

              watchIdRef.current = null;
            }

            let averagePace = null;
            if (distance > 0) {
              const distanceKm = distance / 1000;
              averagePace = elapsedTime / distanceKm;
            }

            const calories = estimateCalories({
              workoutType,
              durationSeconds: elapsedTime,
              distanceMeters: distance,
              weightKg: 70,
              gpsPoints,
            });

            const elevationGain = calculateElevationGain(gpsPoints);

            const workoutId = `workout_${Date.now()}`;

            const workout: StoredWorkout = {
              id: workoutId,
              workoutType,
              startedAt: startedAtRef.current,
              finishedAt: Date.now(),
              elapsedTime,
              distance,
              gpsPointCount: gpsPoints.length,
              averagePace,
              paceSecondsPerKm: averagePace,
              calories,
              elevationGain,
            };

            await saveWorkout(workout, gpsPoints);

            navigation.navigate('WorkoutSummary', {
              workoutType,
              distance,
              elapsedTime,
              gpsPoints,
              calories,
              elevationGain,
              averagePace,
            });
          } catch (error) {
            console.log(
              'FINISH WORKOUT ERROR:',
              error,
            );

            Alert.alert(
              'Error',
              'Could not save the workout.',
            );
          }
        },
      },
    ],
  );
};
const calculateBearing = (
  previous: GPSPoint,
  current: GPSPoint,
) => {
  const lat1 =
    (previous.latitude * Math.PI) / 180;

  const lat2 =
    (current.latitude * Math.PI) / 180;

  const deltaLon =
    ((current.longitude - previous.longitude) *
      Math.PI) /
    180;

  const y =
    Math.sin(deltaLon) * Math.cos(lat2);

  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) *
      Math.cos(lat2) *
      Math.cos(deltaLon);

  const bearing =
    (Math.atan2(y, x) * 180) / Math.PI;

  return (bearing + 360) % 360;
};

const currentBearing = useMemo(() => {
  if (gpsPoints.length < 2) {
    return 0;
  }

  const previousPoint =
    gpsPoints[gpsPoints.length - 2];

  const currentPoint =
    gpsPoints[gpsPoints.length - 1];

  return calculateBearing(
    previousPoint,
    currentPoint,
  );
}, [gpsPoints]);


if (!currentLocation) {
  return (
    <SafeAreaView style={styles.locationScreen}>
      <View style={styles.locationContent}>

        {/* Location Icon */}
        <View style={styles.locationIconContainer}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={styles.locationSpinner}
        />

        {/* Title */}
        <Text style={styles.locationLoadingTitle}>
          Finding Your Location
        </Text>

        {/* Description */}
        <Text style={styles.locationLoadingText}>
          We're getting a precise GPS location before
          starting your workout.
        </Text>

        {/* Helpful message */}
        <View style={styles.locationTipCard}>
          <Text style={styles.locationTipTitle}>
            📡 Getting GPS signal
          </Text>

          <Text style={styles.locationTipText}>
            For better accuracy, make sure you're
            outdoors or near a window.
          </Text>
        </View>

        {/* Cancel */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>
            Cancel Workout
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            {workoutType}
          </Text>

          <Text style={styles.subtitle}>
            {isPaused ? 'Paused' : 'Tracking'}
          </Text>
        </View>

        <View style={{width: 30}} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          mapStyle="https://tiles.openfreemap.org/styles/liberty">

          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [
                currentLocation.longitude,
                currentLocation.latitude,
              ],
              zoom: 16,
              bearing: 0,
            }}
          />
          {currentLocation && (
  <Marker
    id="current-location"
    anchor="center"
    lngLat={[
      currentLocation.longitude,
      currentLocation.latitude,
    ]}>

    <View style={styles.locationMarker}>

      {/* Direction arrow */}
      {gpsPoints.length >= 2 && (
        <View style={styles.directionArrow} />
      )}

      {/* Exact GPS position */}
      <View style={styles.currentLocationDot} />

    </View>

  </Marker>
)}

          {routeCoordinates.length >= 2 && (
            <GeoJSONSource
              id="workout-route"
              data={routeGeoJSON}>

              <Layer
                id="workout-route-line"
                type="line"
                paint={{
                  'line-color': '#2196F3',
                  'line-width': 5,
                  'line-opacity': 0.9,
                }}
              />

            </GeoJSONSource>
          )}
        </Map>

        {/* GPS status */}
        <View style={styles.gpsStatus}>
          <Text style={styles.gpsStatusText}>
            GPS Points: {gpsPoints.length}
          </Text>

          {currentLocation && (
            <>
              <Text style={styles.accuracyText}>
                Accuracy:{' '}
                {currentLocation.accuracy.toFixed(1)} m
              </Text>

              <Text style={styles.accuracyText}>
                {currentLocation.latitude.toFixed(5)},{' '}
                {currentLocation.longitude.toFixed(5)}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {(distance / 1000).toFixed(2)}
          </Text>

          <Text style={styles.statLabel}>
            KM
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {formatTime(elapsedTime)}
          </Text>

          <Text style={styles.statLabel}>
            TIME
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {calculatePace()}
          </Text>

          <Text style={styles.statLabel}>
            PACE
          </Text>
        </View>

      </View>

      {/* Coordinates */}
      {currentLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinates}>
            Lat:{' '}
            {currentLocation.latitude.toFixed(6)}
          </Text>

          <Text style={styles.coordinates}>
            Lon:{' '}
            {currentLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>

        <TouchableOpacity
          style={[
            styles.pauseButton,
            isPaused && styles.resumeButton,
          ]}
          onPress={() => {
            setIsPaused(previous => !previous);
          }}>

          <Text style={styles.buttonText}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={finishWorkout}>

          <Text style={styles.buttonText}>
            Finish
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
  },

  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },

  backButton: {
    fontSize: 40,
    color: '#222222',
    lineHeight: 40,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111111',
  },

  subtitle: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 2,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  map: {
    flex: 1,
  },

  gpsStatus: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  gpsStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#222222',
  },

  accuracyText: {
    fontSize: 11,
    color: '#666666',
    marginTop: 3,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },

  statBox: {
    alignItems: 'center',
    minWidth: 90,
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  statLabel: {
    fontSize: 11,
    color: '#777777',
    marginTop: 4,
  },

  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 10,
  },

  coordinates: {
    fontSize: 11,
    color: '#777777',
  },

  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },

  pauseButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  resumeButton: {
    backgroundColor: '#4CAF50',
  },

  finishButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  currentLocationMarker: {
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
},

locationScreen: {
  flex: 1,
  backgroundColor: '#F7F9FC',
},

locationContent: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 30,
},

locationIconContainer: {
  width: 86,
  height: 86,
  borderRadius: 43,
  backgroundColor: '#E8F2FF',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 24,
},

locationIcon: {
  fontSize: 40,
},

locationSpinner: {
  marginBottom: 20,
},

locationLoadingTitle: {
  fontSize: 26,
  fontWeight: '800',
  color: '#111111',
  textAlign: 'center',
},

locationLoadingText: {
  fontSize: 14,
  lineHeight: 21,
  color: '#777777',
  textAlign: 'center',
  marginTop: 10,
  maxWidth: 320,
},

locationTipCard: {
  width: '100%',
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  padding: 16,
  marginTop: 28,
  borderWidth: 1,
  borderColor: '#E9EDF3',
},

locationTipTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#222222',
},

locationTipText: {
  fontSize: 13,
  lineHeight: 19,
  color: '#777777',
  marginTop: 6,
},

cancelButton: {
  marginTop: 22,
  paddingVertical: 14,
  paddingHorizontal: 28,
  borderRadius: 12,
  backgroundColor: '#EEEEEE',
},

cancelButtonText: {
  fontSize: 14,
  fontWeight: '700',
  color: '#444444',
},

locationMarker: {
  width: 40,
  height: 40,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
},

directionArrow: {
  position: 'absolute',
  top: -3,
  left: 14,
  width: 0,
  height: 0,
  borderLeftWidth: 6,
  borderRightWidth: 6,
  borderBottomWidth: 14,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderBottomColor: '#2196F3',
},

currentLocationDot: {
  position: 'absolute',
  top: 11,
  left: 11,
  width: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: '#2196F3',
  borderWidth: 3,
  borderColor: '#FFFFFF',

  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3,
  elevation: 4,
},

});

export default WorkoutScreen;