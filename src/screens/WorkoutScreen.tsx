import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
} from '@maplibre/maplibre-react-native';

import Geolocation, {
  type GeolocationResponse,
} from '@react-native-community/geolocation';

import {
  AppIcon,
  GPSQualityIndicator,
  SecondaryButton,
  StatusIndicator,
} from '../components';
import {saveWorkout} from '../services/WorkoutStorage';
import {
  COLORS,
  MAP_STYLE_URL,
  RADII,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../theme/theme';
import {StoredWorkout} from '../types/Workout';
import {estimateCalories} from '../utils/CalorieUtils';
import {calculateElevationGain} from '../utils/ElevationUtils';
import {
  GPSPoint,
  calculateDistance,
  isValidGPSPoint,
} from '../utils/GPSUtils';

type WorkoutScreenProps = {
  route: {
    params: {
      workoutType: 'Walk' | 'Run';
    };
  };
  navigation: any;
};

const WorkoutScreen = ({route, navigation}: WorkoutScreenProps) => {
  const {workoutType} = route.params;

  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefiningInitialFix, setIsRefiningInitialFix] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastPointRef = useRef<GPSPoint | null>(null);
  const isPausedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());
  const cameraRef = useRef<any>(null);

  const radarPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentLocation) {
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(radarPulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [currentLocation, radarPulse]);

  /*
   * Keep pause state available inside GPS callback
   */
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  /*
   * Android location permission (checks before prompting to avoid redundant dialogs)
   */
  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    if (typeof PermissionsAndroid.check === 'function') {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (hasPermission) {
        return true;
      }
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs your location to track your workout.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    console.log('LOCATION PERMISSION:', granted);

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  /*
   * Convert native position to our GPSPoint
   */
  const createGPSPoint = (position: GeolocationResponse): GPSPoint => {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude ?? null,
      speed: position.coords.speed ?? null,
    };
  };

  const CACHED_PREVIEW_MAX_AGE_MS = 60000;
  const CACHED_PREVIEW_MAX_ACCURACY_M = 100;
  const FRESH_RECORDING_MAX_AGE_MS = 15000;

  /*
   * Process GPS position
   */
  const processGPSPosition = (
    position: GeolocationResponse,
    options: {allowCachedPreview?: boolean} = {},
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
    const pointAgeMs = Math.max(0, Date.now() - newPoint.timestamp);

    /*
     * First point: never record stale or inaccurate cached locations into gpsPoints/distance
     */
    if (!lastPointRef.current) {
      const isFreshAndAccurate =
        pointAgeMs <= FRESH_RECORDING_MAX_AGE_MS &&
        isValidGPSPoint(null, newPoint);

      if (isFreshAndAccurate) {
        console.log('FIRST GPS POINT');
        lastPointRef.current = newPoint;
        setGpsPoints([newPoint]);
        setCurrentLocation(newPoint);
        setIsRefiningInitialFix(false);
        setLocationError(null);
        return;
      }

      if (
        options.allowCachedPreview &&
        Number.isFinite(newPoint.latitude) &&
        Number.isFinite(newPoint.longitude) &&
        pointAgeMs <= CACHED_PREVIEW_MAX_AGE_MS &&
        newPoint.accuracy <= CACHED_PREVIEW_MAX_ACCURACY_M
      ) {
        // Show map immediately using recent cached fix without recording it as a route point
        setCurrentLocation(prev => prev ?? newPoint);
        setIsRefiningInitialFix(true);
        setLocationError(null);
      }

      return;
    }

    const previousPoint = lastPointRef.current;

    /*
     * Validate GPS point
     */
    const valid = isValidGPSPoint(previousPoint, newPoint);

    if (!valid) {
      console.log('GPS POINT REJECTED');

      return;
    }

    /*
     * Calculate distance
     */
    const segmentDistance = calculateDistance(previousPoint, newPoint);

    console.log('GPS DISTANCE:', segmentDistance, 'meters');

    /*
     * Update last point
     */
    lastPointRef.current = newPoint;

    /*
     * Add point
     */
    setGpsPoints(previous => [...previous, newPoint]);

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
    setIsRefiningInitialFix(false);
    setLocationError(null);
  };

  /*
   * Start workout
   */
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const startWorkout = async () => {
      /*
       * Configure Android location provider (uses FusedLocationProvider when available,
       * automatically falling back to AndroidLocationManager otherwise)
       */
      Geolocation.setRNConfiguration({
        skipPermissionRequests: true,
        locationProvider: 'playServices',
      });

      console.log('Geolocation configured');

      /*
       * Permission
       */
      const permission = await requestLocationPermission();

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
       * Fast initial location (reuses recent valid cached fix if available)
       * while continuous high-accuracy watchPosition starts immediately in parallel
       */
      console.log('REQUESTING CURRENT LOCATION...');

      Geolocation.getCurrentPosition(
        position => {
          console.log(
            'INITIAL LOCATION:',
            position.coords.latitude,
            position.coords.longitude,
          );

          processGPSPosition(position, {allowCachedPreview: true});
        },
        error => {
          console.log('INITIAL LOCATION ERROR:', error.code, error.message);
          if (!lastPointRef.current && error.code === 2) {
            setLocationError(
              'GPS appears to be turned off. Please enable Location Services in your device settings.',
            );
          } else if (!lastPointRef.current && error.code === 3) {
            setLocationError(
              'GPS lock is taking longer than usual. Move to an open area while we keep searching.',
            );
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 4000,
          maximumAge: CACHED_PREVIEW_MAX_AGE_MS,
        },
      );

      /*
       * Start continuous high-accuracy GPS tracking immediately in parallel
       */
      console.log('STARTING GPS WATCH...');

      const id = Geolocation.watchPosition(
        position => {
          processGPSPosition(position);
        },
        error => {
          console.log('WATCH LOCATION ERROR:', error.code, error.message);
          if (!lastPointRef.current && error.code === 2) {
            setLocationError(
              'GPS appears to be turned off. Please enable Location Services in your device settings.',
            );
          }
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

      console.log('GPS WATCH STARTED:', id);
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
        Geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      gpsPoints.length === 0 ||
      !currentLocation ||
      !cameraRef.current
    ) {
      return;
    }

    const currentIndex = gpsPoints.length - 1;

    let bearing = 0;

    if (currentIndex > 0) {
      const previousPoint = gpsPoints[currentIndex - 1];

      const currentPoint = gpsPoints[currentIndex];

      bearing = calculateBearing(previousPoint, currentPoint);
    }

    cameraRef.current.easeTo({
      center: [currentLocation.longitude, currentLocation.latitude],
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

    const minutes = Math.floor((seconds % 3600) / 60);

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

    const paceSeconds = Math.floor((pace - paceMinutes) * 60);

    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')} /km`;
  };

  /*
   * Route coordinates
   */
  const routeCoordinates = useMemo(() => {
    return gpsPoints.map(point => [point.longitude, point.latitude]);
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
                Geolocation.clearWatch(watchIdRef.current);

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
              console.log('FINISH WORKOUT ERROR:', error);

              Alert.alert('Error', 'Could not save the workout.');
            }
          },
        },
      ],
    );
  };

  const calculateBearing = (previous: GPSPoint, current: GPSPoint) => {
    const lat1 = (previous.latitude * Math.PI) / 180;

    const lat2 = (current.latitude * Math.PI) / 180;

    const deltaLon = ((current.longitude - previous.longitude) * Math.PI) / 180;

    const y = Math.sin(deltaLon) * Math.cos(lat2);

    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;

    return (bearing + 360) % 360;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentBearing = useMemo(() => {
    if (gpsPoints.length < 2) {
      return 0;
    }

    const previousPoint = gpsPoints[gpsPoints.length - 2];

    const currentPoint = gpsPoints[gpsPoints.length - 1];

    return calculateBearing(previousPoint, currentPoint);
  }, [gpsPoints]);

  if (!currentLocation) {
    const ringScale = radarPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1.45],
    });
    const ringOpacity = radarPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.45, 0],
    });

    return (
      <SafeAreaView style={styles.locationScreen}>
        <StatusBar barStyle="light-content" />

        <View style={styles.locationGlow} pointerEvents="none" />

        <View style={styles.locationContent}>
          <StatusIndicator variant="searching" label={`Preparing ${workoutType}`} />

          <View style={styles.radarStage}>
            <Animated.View
              style={[
                styles.radarRing,
                {
                  transform: [{scale: ringScale}],
                  opacity: ringOpacity,
                },
              ]}
            />
            <View style={styles.locationIconContainer}>
              <AppIcon name="gps" size={34} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.locationLoadingTitle}>Getting your location...</Text>

          <Text style={styles.locationLoadingText}>
            {locationError ??
              `Waiting for a fast GPS lock before starting your ${workoutType.toLowerCase()} route.`}
          </Text>

          <View style={styles.locationTipCard}>
            <View style={styles.tipHeader}>
              <View style={styles.tipIconWrap}>
                <AppIcon name="pin" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.locationTipTitle}>Getting GPS signal</Text>
            </View>

            <Text style={styles.locationTipText}>
              For better accuracy, make sure you're outdoors or near a window with clear sky view.
            </Text>
          </View>

          <SecondaryButton
            label="Cancel Workout"
            tone="neutral"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isRun = workoutType === 'Run';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark Athletic Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBackButton}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <AppIcon name="back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.workoutTypeBadge}>
            <AppIcon
              name={isRun ? 'run' : 'walk'}
              size={16}
              color={isRun ? COLORS.coral : COLORS.primary}
            />
            <Text style={styles.headerTitle}>{workoutType}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <StatusIndicator
            variant={isPaused ? 'paused' : 'tracking'}
            label={isPaused ? 'Paused' : 'Tracking'}
          />
        </View>
      </View>

      {/* Hero Map Region */}
      <View style={styles.mapContainer}>
        <Map
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          attribution={true}
          onDidFinishLoadingMap={() => {
            setMapLoading(false);
            setMapError(false);
          }}
          onDidFailLoadingMap={() => {
            setMapLoading(false);
            setMapError(true);
          }}>
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [currentLocation.longitude, currentLocation.latitude],
              zoom: 16,
              bearing: 0,
            }}
          />

          {currentLocation && (
            <Marker
              id="current-location"
              anchor="center"
              lngLat={[currentLocation.longitude, currentLocation.latitude]}>
              <View style={styles.locationMarker}>
                <View style={styles.locationHalo} />

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
            <GeoJSONSource id="workout-route" data={routeGeoJSON}>
              <Layer
                id="workout-route-line"
                type="line"
                paint={{
                  'line-color': COLORS.mapRoute,
                  'line-width': 5.5,
                  'line-opacity': 0.94,
                }}
              />
            </GeoJSONSource>
          )}
        </Map>

        {/* Floating Dark-Glass GPS Quality Pill */}
        <View style={styles.gpsOverlay}>
          <GPSQualityIndicator
            accuracy={currentLocation.accuracy}
            pointCount={gpsPoints.length}
          />
        </View>

        {mapLoading && !mapError ? (
          <View style={styles.mapStatusPill}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.mapStatusText}>Loading map…</Text>
          </View>
        ) : null}

        {isRefiningInitialFix && !mapError ? (
          <View style={styles.refiningBanner}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.refiningText}>
              Refining GPS accuracy before recording route…
            </Text>
          </View>
        ) : null}

        {mapError ? (
          <View style={styles.mapErrorBanner}>
            <AppIcon name="alert" size={16} color={COLORS.warningDark} />
            <Text style={styles.mapErrorText}>
              Map tiles unavailable — GPS tracking continues normally
            </Text>
          </View>
        ) : null}
      </View>

      {/* Dark Glass Telemetry & Controls Panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.heroDistanceRow}>
          <View>
            <Text style={styles.heroLabel}>DISTANCE</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>
                {(distance / 1000).toFixed(2)}
              </Text>
              <Text style={styles.heroUnit}>KM</Text>
            </View>
          </View>

          <View style={styles.secondaryMetricsGroup}>
            <View style={styles.secondaryMetricBox}>
              <View style={styles.secondaryMetricHeader}>
                <AppIcon name="time" size={13} color={COLORS.primary} />
                <Text style={styles.secondaryLabel}>TIME</Text>
              </View>
              <Text style={styles.secondaryValue}>
                {formatTime(elapsedTime)}
              </Text>
            </View>

            <View style={styles.secondaryDivider} />

            <View style={styles.secondaryMetricBox}>
              <View style={styles.secondaryMetricHeader}>
                <AppIcon name="pace" size={13} color={COLORS.accent} />
                <Text style={styles.secondaryLabel}>AVG PACE</Text>
              </View>
              <Text style={styles.secondaryValue}>{calculatePace()}</Text>
            </View>
          </View>
        </View>

        {isPaused ? (
          <View style={styles.pausedBanner}>
            <AppIcon name="pause" size={13} color={COLORS.warningDark} />
            <Text style={styles.pausedBannerText}>
              Workout paused • Tap Resume to continue tracking
            </Text>
          </View>
        ) : null}

        <View style={styles.controls}>
          <Pressable
            style={({pressed}) => [
              styles.controlButton,
              isPaused ? styles.resumeButton : styles.pauseButton,
              pressed && styles.controlPressed,
            ]}
            onPress={() => {
              setIsPaused(previous => !previous);
            }}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume workout' : 'Pause workout'}>
            <AppIcon
              name={isPaused ? 'play' : 'pause'}
              size={18}
              color={COLORS.textOnPrimary}
            />
            <Text style={styles.controlButtonTextDark}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </Pressable>

          <Pressable
            style={({pressed}) => [
              styles.controlButton,
              styles.finishButton,
              pressed && styles.controlPressed,
            ]}
            onPress={finishWorkout}
            accessibilityRole="button"
            accessibilityLabel="Finish workout">
            <AppIcon name="stop" size={16} color={COLORS.textPrimary} />
            <Text style={styles.controlButtonTextLight}>Finish</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  headerBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  workoutTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: COLORS.surfaceSubtle,
  },
  map: {
    flex: 1,
  },
  gpsOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
  },
  mapStatusPill: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.overlayLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  refiningBanner: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.overlayDark,
    borderWidth: 1,
    borderColor: COLORS.primaryMuted,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  refiningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  mapErrorBanner: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.overlayDark,
    borderWidth: 1,
    borderColor: 'rgba(255, 176, 32, 0.4)',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  mapErrorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warningDark,
  },
  bottomPanel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.floating,
  },
  heroDistanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  heroLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
  heroUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  secondaryMetricsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  secondaryMetricBox: {
    alignItems: 'flex-start',
    minWidth: 74,
  },
  secondaryMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  secondaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  secondaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  secondaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.warningSoft,
    borderRadius: RADII.sm,
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  pausedBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.warningDark,
  },
  controls: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  controlButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: RADII.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  controlPressed: {
    opacity: 0.88,
    transform: [{scale: 0.98}],
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
  },
  finishButton: {
    backgroundColor: COLORS.error,
  },
  controlButtonTextDark: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  controlButtonTextLight: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  locationScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  locationGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: COLORS.secondarySoft,
    opacity: 0.7,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  locationContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  radarStage: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  radarRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  locationIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  locationLoadingTitle: {
    ...TYPOGRAPHY.titleLarge,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  locationLoadingText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    marginTop: SPACING.xs,
    maxWidth: 310,
  },
  locationTipCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  tipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  locationTipText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  cancelButton: {
    marginTop: SPACING.lg,
    alignSelf: 'stretch',
  },
  locationMarker: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locationHalo: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(22, 119, 255, 0.24)',
  },
  directionArrow: {
    position: 'absolute',
    top: -2,
    left: 16,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.background,
  },
  currentLocationDot: {
    position: 'absolute',
    top: 13,
    left: 13,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.mapRoute,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...SHADOWS.card,
  },
});

export default WorkoutScreen;
