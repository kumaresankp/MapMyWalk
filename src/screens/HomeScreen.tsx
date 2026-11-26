import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';

import {useFocusEffect} from '@react-navigation/native';

import {
  AppHeader,
  AppIcon,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  SideDrawer,
  StatCard,
  WorkoutCard,
  WorkoutTypeSelector,
} from '../components';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../context/ThemeContext';
import {getWorkouts} from '../services/WorkoutStorage';
import {RADII, SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import {StoredWorkout} from '../types/Workout';

type Props = {
  navigation: any;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HomeScreen = ({navigation}: Props) => {
  const {colors, resolvedTheme} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {user, profile, isGuest, signOut, exitGuestMode} = useAuth();
  const [workoutType, setWorkoutType] = useState<'Walk' | 'Run'>('Walk');
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  /*
   * Load workouts whenever Home becomes visible
   */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadWorkouts = async () => {
        const saved = await getWorkouts();
        if (isActive) {
          setWorkouts(saved);
          setIsLoading(false);
        }
      };

      loadWorkouts();

      // Silently warm up GPS in the background only if permission is already granted
      const warmUpGps = async () => {
        try {
          if (
            Platform.OS === 'android' &&
            typeof PermissionsAndroid.check === 'function'
          ) {
            const granted = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            if (!granted) {
              return;
            }
          } else if (Platform.OS === 'android') {
            return;
          }

          Geolocation.setRNConfiguration({
            skipPermissionRequests: true,
            locationProvider: 'playServices',
          });
          Geolocation.getCurrentPosition(
            () => {},
            () => {},
            {
              enableHighAccuracy: true,
              timeout: 4000,
              maximumAge: 15000,
            },
          );
        } catch {
          // Non-critical warm-up
        }
      };

      warmUpGps();

      return () => {
        isActive = false;
      };
    }, []),
  );

  /*
   * Today's workouts
   */
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayWorkouts = workouts.filter(
    workout => workout.finishedAt >= todayStart.getTime(),
  );

  /*
   * Today's distance
   */
  const todayDistance = todayWorkouts.reduce(
    (total, workout) => total + workout.distance,
    0,
  );

  /*
   * Current week's 7-day strip derived strictly from real local workouts
   */
  const weekDays = useMemo(() => {
    const now = new Date();
    const todayIndex = now.getDay();
    const sunday = new Date(now);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(now.getDate() - todayIndex);

    return DAY_LABELS.map((label, idx) => {
      const dateObj = new Date(sunday);
      dateObj.setDate(sunday.getDate() + idx);
      const dayStart = dateObj.getTime();
      const dayEnd = dayStart + 86400000;
      const hasWorkout = workouts.some(
        w => w.finishedAt >= dayStart && w.finishedAt < dayEnd,
      );

      return {
        label,
        dateNum: dateObj.getDate(),
        isToday: idx === todayIndex,
        hasWorkout,
      };
    });
  }, [workouts]);

  /*
   * Start workout
   */
  const startWorkout = () => {
    navigation.navigate('Workout', {
      workoutType,
    });
  };

  const showPrivacyNotice = () => {
    Alert.alert(
      'Privacy & Data',
      'GPS Fitness Tracker uses your location only to record workout routes and store them locally on this device. At this stage, no cloud synchronization or automatic uploads are implemented.',
    );
  };

  const displayName =
    profile?.full_name ||
    (typeof user?.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : '') ||
    user?.email?.split('@')[0] ||
    '';

  const profileInitials = (() => {
    if (isGuest || !user) {
      return 'GU';
    }
    const source = displayName || 'MW';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  })();

  const greetingText =
    !isGuest && displayName
      ? `Hello, ${displayName.split(' ')[0]}`
      : 'MyWalkMap';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* Subtle top emerald ambient glow matching reference */}
      <View style={styles.ambientGlow} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }}>
          {/* Greeting / Brand Header */}
          <AppHeader
            variant="brand"
            greeting={greetingText}
            subtitle="Every Step Has a Story."
            avatarUrl={profile?.avatar_url}
            rightActionIcon="shield"
            rightActionLabel="Privacy and Data"
            onRightActionPress={showPrivacyNotice}
            profileInitials={profileInitials}
            onProfilePress={() => navigation.navigate('Profile')}
            onMenuPress={() => setDrawerOpen(true)}
          />

          {/* Glowing Emerald Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBannerLeft}>
              <View style={styles.heroBadgeCircle}>
                <AppIcon
                  name={workoutType === 'Run' ? 'run' : 'walk'}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.heroBannerText}>
                <Text style={styles.heroBannerTitle}>MyWalkMap</Text>
                <Text style={styles.heroBannerSubtitle}>
                  Ready for your {workoutType.toLowerCase()}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={startWorkout}
              style={({pressed}) => [
                styles.heroStartPill,
                pressed && styles.heroStartPillPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Quick Start ${workoutType}`}>
              <Text style={styles.heroStartPillText}>START</Text>
            </Pressable>
          </View>

          {/* 7-Day Activity Strip */}
          <View style={styles.weekRow}>
            {weekDays.map(day => (
              <View key={day.label} style={styles.weekDayCol}>
                <Text
                  style={[
                    styles.weekDayLabel,
                    day.isToday && styles.weekDayLabelToday,
                  ]}>
                  {day.label}
                </Text>
                <View
                  style={[
                    styles.weekDateCircle,
                    day.isToday && styles.weekDateCircleToday,
                  ]}>
                  <Text
                    style={[
                      styles.weekDateNum,
                      day.isToday && styles.weekDateNumToday,
                    ]}>
                    {day.dateNum}
                  </Text>
                </View>
                <View
                  style={[
                    styles.weekWorkoutDot,
                    day.hasWorkout && styles.weekWorkoutDotActive,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Activity Selector & Primary Start */}
          <View style={styles.launcherCard}>
            <WorkoutTypeSelector
              value={workoutType}
              onChange={setWorkoutType}
            />

            <PrimaryButton
              label={`Start ${workoutType}`}
              icon="play"
              onPress={startWorkout}
              style={styles.startButton}
            />
          </View>

          {/* Today's Activity */}
          <View style={styles.section}>
            <SectionHeader title="Today's Activity" />

            <View style={styles.statsRow}>
              <StatCard
                label="Distance"
                value={(todayDistance / 1000).toFixed(2)}
                unit="km"
                icon="distance"
                accentColor={colors.primary}
                style={styles.statCard}
              />

              <StatCard
                label="Workouts"
                value={String(todayWorkouts.length)}
                unit={todayWorkouts.length === 1 ? 'session' : 'sessions'}
                icon="check"
                accentColor={colors.accent}
                style={styles.statCard}
              />
            </View>
          </View>

          {/* Workout History Navigation */}
          <SecondaryButton
            label="View Workout History"
            icon="history"
            tone="neutral"
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={styles.historyButton}
          />

          {/* Recent Activity */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Activity"
              actionLabel={workouts.length > 0 ? 'See all' : undefined}
              onActionPress={
                workouts.length > 0
                  ? () => navigation.navigate('WorkoutHistory')
                  : undefined
              }
            />

            {isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading recent workouts…</Text>
              </View>
            ) : workouts.length === 0 ? (
              <EmptyState
                icon="distance"
                title="No workouts yet"
                description="Complete your first walk or run to see your route history and stats here."
              />
            ) : (
              workouts.slice(0, 3).map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onPress={() =>
                    navigation.navigate('WorkoutDetail', {
                      workoutId: workout.id,
                    })
                  }
                />
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        displayName={displayName}
        email={user?.email}
        initials={profileInitials}
        avatarUrl={profile?.avatar_url}
        isGuest={isGuest}
        onNavigateHome={() => {}}
        onNavigateProfile={() => navigation.navigate('Profile')}
        onNavigateHistory={() => navigation.navigate('WorkoutHistory')}
        onStartWalk={() =>
          navigation.navigate('Workout', {workoutType: 'Walk'})
        }
        onStartRun={() =>
          navigation.navigate('Workout', {workoutType: 'Run'})
        }
        onOpenPrivacy={showPrivacyNotice}
        onAuthAction={async () => {
          if (isGuest) {
            exitGuestMode();
            return;
          }
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert('Sign Out', error?.message || 'Unable to sign out.');
          }
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    ambientGlow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 220,
      backgroundColor: colors.secondarySoft,
      opacity: 0.75,
      borderBottomLeftRadius: 48,
      borderBottomRightRadius: 48,
    },
    scrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.xxl,
    },
    heroBanner: {
      backgroundColor: '#1E7E3D',
      borderRadius: RADII.xl,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: 'rgba(180, 255, 42, 0.35)',
      ...SHADOWS.floating,
    },
    heroBannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      flex: 1,
    },
    heroBadgeCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroBannerText: {
      flex: 1,
    },
    heroBannerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#F8FAF9',
    },
    heroBannerSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: 'rgba(248, 250, 249, 0.85)',
      marginTop: 2,
    },
    heroStartPill: {
      backgroundColor: '#F8FAF9',
      paddingHorizontal: SPACING.md,
      paddingVertical: 10,
      borderRadius: RADII.pill,
    },
    heroStartPillPressed: {
      opacity: 0.85,
    },
    heroStartPillText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#0A0C0B',
      letterSpacing: 0.6,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: SPACING.lg,
      marginBottom: SPACING.md,
      paddingHorizontal: 2,
    },
    weekDayCol: {
      alignItems: 'center',
      gap: 5,
    },
    weekDayLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    weekDayLabelToday: {
      color: colors.primary,
      fontWeight: '800',
    },
    weekDateCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    weekDateCircleToday: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    weekDateNum: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textPrimary,
      fontVariant: ['tabular-nums'],
    },
    weekDateNumToday: {
      color: colors.primary,
      fontWeight: '800',
    },
    weekWorkoutDot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
      backgroundColor: 'transparent',
    },
    weekWorkoutDotActive: {
      backgroundColor: colors.accent,
    },
    launcherCard: {
      backgroundColor: colors.surface,
      borderRadius: RADII.xl,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.card,
    },
    startButton: {
      marginTop: SPACING.md,
    },
    section: {
      marginTop: SPACING.xl,
    },
    statsRow: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    statCard: {
      flex: 1,
    },
    historyButton: {
      marginTop: SPACING.md,
    },
    loadingCard: {
      backgroundColor: colors.surface,
      borderRadius: RADII.lg,
      padding: SPACING.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    loadingText: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
    },
  });

export default HomeScreen;
