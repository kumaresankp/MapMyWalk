import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useFocusEffect} from '@react-navigation/native';

import {
  AppHeader,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  StatCard,
  WorkoutCard,
  WorkoutTypeSelector,
} from '../components';
import {getWorkouts} from '../services/WorkoutStorage';
import {useAuth} from '../context/AuthContext';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
import {StoredWorkout} from '../types/Workout';

type Props = {
  navigation: any;
};

const HomeScreen = ({navigation}: Props) => {
  const {user, profile, isGuest} = useAuth();
  const [workoutType, setWorkoutType] = useState<'Walk' | 'Run'>('Walk');
  const [workouts, setWorkouts] = useState<StoredWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const profileInitials = (() => {
    if (isGuest || !user) {
      return 'GU';
    }
    const name =
      profile?.full_name ||
      (typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : '') ||
      user.email?.split('@')[0] ||
      'MW';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  })();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }}>
          {/* Brand Header */}
          <AppHeader
            variant="brand"
            rightActionIcon="shield"
            rightActionLabel="Privacy and Data"
            onRightActionPress={showPrivacyNotice}
            profileInitials={profileInitials}
            onProfilePress={() => navigation.navigate('Profile')}
          />

          {/* Workout Launcher Hero */}
          <View style={styles.launcherCard}>
            <View style={styles.launcherHeader}>
              <View style={styles.liveDot} />
              <Text style={styles.launcherOverline}>READY TO MOVE</Text>
            </View>

            <Text style={styles.launcherTitle}>Choose Your Activity</Text>

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
                accentColor={COLORS.primary}
                style={styles.statCard}
              />

              <StatCard
                label="Workouts"
                value={String(todayWorkouts.length)}
                unit={todayWorkouts.length === 1 ? 'session' : 'sessions'}
                icon="check"
                accentColor={COLORS.success}
                style={styles.statCard}
              />
            </View>
          </View>

          {/* Workout History Navigation */}
          <SecondaryButton
            label="View Workout History"
            icon="history"
            tone="primary"
            onPress={() => navigation.navigate('WorkoutHistory')}
            style={styles.historyButton}
          />

          {/* Recent Workouts */}
          <View style={styles.section}>
            <SectionHeader
              title="Recent Workouts"
              actionLabel={workouts.length > 0 ? 'See all' : undefined}
              onActionPress={
                workouts.length > 0
                  ? () => navigation.navigate('WorkoutHistory')
                  : undefined
              }
            />

            {isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator size="small" color={COLORS.primary} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  launcherCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  launcherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xxs,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  launcherOverline: {
    ...TYPOGRAPHY.overline,
    color: COLORS.primary,
  },
  launcherTitle: {
    ...TYPOGRAPHY.sectionTitle,
    fontSize: 18,
    marginBottom: SPACING.sm,
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
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
