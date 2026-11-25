import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {COLORS, RADII, SHADOWS, SPACING} from '../theme/theme';

type GPSQualityIndicatorProps = {
  accuracy: number | null | undefined;
  pointCount: number;
};

/**
 * Floating map badge displaying GPS accuracy quality (bars + text) and recorded point count.
 */
const GPSQualityIndicator = ({
  accuracy,
  pointCount,
}: GPSQualityIndicatorProps) => {
  const hasAccuracy = typeof accuracy === 'number' && Number.isFinite(accuracy);

  const quality: {
    label: string;
    bars: number;
    color: string;
    bg: string;
  } = !hasAccuracy
    ? {
        label: 'Searching',
        bars: 0,
        color: COLORS.textSecondary,
        bg: COLORS.surfaceSubtle,
      }
    : accuracy <= 10
    ? {
        label: 'GPS Strong',
        bars: 3,
        color: COLORS.success,
        bg: COLORS.successSoft,
      }
    : accuracy <= 22
    ? {
        label: 'GPS Fair',
        bars: 2,
        color: COLORS.warning,
        bg: COLORS.warningSoft,
      }
    : {
        label: 'GPS Weak',
        bars: 1,
        color: COLORS.error,
        bg: COLORS.errorSoft,
      };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.signalBadge, {backgroundColor: quality.bg}]}>
          <View style={styles.barsRow}>
            {[1, 2, 3].map(level => (
              <View
                key={level}
                style={[
                  styles.bar,
                  {
                    height: 4 + level * 3,
                    backgroundColor:
                      level <= quality.bars ? quality.color : COLORS.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.qualityText, {color: quality.color}]}>
            {quality.label}
          </Text>
        </View>

        {hasAccuracy ? (
          <Text style={styles.accuracyText}>±{accuracy.toFixed(0)} m</Text>
        ) : null}
      </View>

      <Text style={styles.pointsText}>
        {pointCount} {pointCount === 1 ? 'GPS point' : 'GPS points'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.overlayLight,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.floating,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADII.pill,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 13,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
  qualityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  pointsText: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});

export default GPSQualityIndicator;
