import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';

import {COLORS, RADII, SPACING} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type StatusVariant = 'tracking' | 'paused' | 'completed' | 'searching';

type StatusIndicatorProps = {
  variant: StatusVariant;
  label?: string;
};

/**
 * Accessible dark-mode status pill pairing color, icon, and explicit text label.
 */
const StatusIndicator = ({variant, label}: StatusIndicatorProps) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (variant !== 'tracking' && variant !== 'searching') {
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();

    return () => loop.stop();
  }, [variant, pulse]);

  const config: Record<
    StatusVariant,
    {bg: string; border: string; fg: string; dot: string; text: string; icon: AppIconName}
  > = {
    tracking: {
      bg: COLORS.successSoft,
      border: 'rgba(46, 230, 110, 0.35)',
      fg: COLORS.successDark,
      dot: COLORS.success,
      text: label ?? 'Live Tracking',
      icon: 'gps',
    },
    paused: {
      bg: COLORS.warningSoft,
      border: 'rgba(255, 176, 32, 0.35)',
      fg: COLORS.warningDark,
      dot: COLORS.warning,
      text: label ?? 'Paused',
      icon: 'pause',
    },
    completed: {
      bg: COLORS.primarySoft,
      border: COLORS.primaryMuted,
      fg: COLORS.primary,
      dot: COLORS.primary,
      text: label ?? 'Completed',
      icon: 'check',
    },
    searching: {
      bg: COLORS.primarySoft,
      border: COLORS.primaryMuted,
      fg: COLORS.primary,
      dot: COLORS.primary,
      text: label ?? 'Acquiring GPS',
      icon: 'gps',
    },
  };

  const current = config[variant];

  return (
    <View
      style={[
        styles.pill,
        {backgroundColor: current.bg, borderColor: current.border},
      ]}>
      <Animated.View
        style={[
          styles.dot,
          {backgroundColor: current.dot, opacity: pulse},
        ]}
      />
      <AppIcon name={current.icon} size={12} color={current.fg} />
      <Text style={[styles.text, {color: current.fg}]}>{current.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADII.pill,
    borderWidth: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StatusIndicator;
