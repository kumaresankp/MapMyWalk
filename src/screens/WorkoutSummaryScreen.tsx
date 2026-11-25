import React, {useEffect, useRef} from 'react';
import {
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  AppIcon,
  PrimaryButton,
  RouteMapPreview,
  SecondaryButton,
  SectionHeader,
  StatCard,
  StatusIndicator,
} from '../components';
import {formatDuration, formatPace} from '../theme/formatters';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';
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

const WorkoutSummaryScreen = ({
  route,
  navigation,
}: WorkoutSummaryScreenProps) => {
  const {
    workoutType,
    distance,
    elapsedTime,
    gpsPoints,
    calories,
    elevationGain,
    averagePace,
  } = route.params;

  const badgeScale = useRef(new Animated.Value(0.85)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeScale, contentFade]);

  const paceText = formatPace(averagePace);
  const isRun = workoutType === 'Run';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Emerald-Glow Dark Hero Card */}
        <View style={styles.heroCard}>
          <Animated.View
            style={[
              styles.checkCircle,
              {transform: [{scale: badgeScale}]},
            ]}>
            <AppIcon name="check" size={30} color={COLORS.textOnPrimary} />
          </Animated.View>

          <StatusIndicator variant="completed" label="Workout Completed" />

          <Text style={styles.heroDistance}>
            {(distance / 1000).toFixed(2)}
          </Text>
          <Text style={styles.heroDistanceLabel}>KILOMETERS</Text>

          <View style={styles.typePill}>
            <AppIcon
              name={isRun ? 'run' : 'walk'}
              size={15}
              color={isRun ? COLORS.coral : COLORS.primary}
            />
            <Text style={styles.typePillText}>{workoutType} Session</Text>
          </View>
        </View>

        <Animated.View style={[styles.body, {opacity: contentFade}]}>
          <View style={styles.section}>
            <SectionHeader title="Recorded Route" />
            <RouteMapPreview
              routePoints={gpsPoints}
              height={210}
              sourceId="workout-summary-route"
              layerId="workout-summary-line"
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Performance Breakdown" />

            <View style={styles.statsGrid}>
              <StatCard
                label="Duration"
                value={formatDuration(elapsedTime)}
                icon="time"
                accentColor={COLORS.primary}
                style={styles.gridItem}
              />

              <StatCard
                label="Avg Pace"
                value={paceText}
                unit={paceText !== '—' ? '/km' : undefined}
                icon="pace"
                accentColor={COLORS.accent}
                style={styles.gridItem}
              />

              <StatCard
                label="Calories"
                value={calories != null ? String(calories) : '—'}
                unit={calories != null ? 'kcal' : undefined}
                icon="calories"
                accentColor={COLORS.coral}
                style={styles.gridItem}
              />

              <StatCard
                label="Elevation Gain"
                value={elevationGain != null ? String(elevationGain) : '—'}
                unit={elevationGain != null ? 'm' : undefined}
                icon="elevation"
                accentColor={COLORS.accent}
                style={styles.gridItem}
              />

              <StatCard
                label="GPS Points"
                value={String(gpsPoints.length)}
                icon="gps"
                accentColor={COLORS.primary}
                style={styles.gridItem}
              />

              <StatCard
                label="Activity"
                value={workoutType}
                icon={isRun ? 'run' : 'walk'}
                accentColor={isRun ? COLORS.coral : COLORS.primary}
                style={styles.gridItem}
              />
            </View>
          </View>

          <View style={styles.noteCard}>
            <View style={styles.noteRow}>
              <AppIcon name="pin" size={16} color={COLORS.primary} />
              <Text style={styles.noteTitle}>Route Recorded</Text>
            </View>
            <Text style={styles.noteText}>
              Your GPS path includes {gpsPoints.length} tracked points. Calories are estimated and intended for personal fitness tracking.
            </Text>
          </View>

          <View style={styles.buttons}>
            <PrimaryButton
              label="Back to Home"
              onPress={() => navigation.popToTop()}
            />
            <SecondaryButton
              label="View Workout History"
              icon="history"
              tone="neutral"
              onPress={() => navigation.navigate('WorkoutHistory')}
            />
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
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  heroCard: {
    backgroundColor: COLORS.secondarySoft,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: RADII.xl,
    borderBottomRightRadius: RADII.xl,
    borderBottomWidth: 1,
    borderColor: COLORS.primaryMuted,
    alignItems: 'center',
    ...SHADOWS.floating,
  },
  checkCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroDistance: {
    marginTop: SPACING.md,
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.5,
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  heroDistanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: COLORS.primary,
    marginTop: 2,
  },
  typePill: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  body: {
    paddingHorizontal: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  gridItem: {
    width: '48.2%',
  },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 6,
  },
  noteTitle: {
    ...TYPOGRAPHY.cardTitle,
    fontSize: 15,
  },
  noteText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
  },
  buttons: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
});

export default WorkoutSummaryScreen;
