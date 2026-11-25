import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {COLORS, RADII, SPACING} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: AppIconName;
  tone?: 'neutral' | 'primary' | 'danger' | 'warning';
  style?: StyleProp<ViewStyle>;
};

/**
 * Medium-emphasis dark pill button for secondary actions and controls.
 */
const SecondaryButton = ({
  label,
  onPress,
  icon,
  tone = 'primary',
  style,
}: SecondaryButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const palette =
    tone === 'danger'
      ? {
          bg: COLORS.errorSoft,
          border: 'rgba(255, 77, 79, 0.35)',
          text: COLORS.errorDark,
        }
      : tone === 'warning'
      ? {
          bg: COLORS.warningSoft,
          border: 'rgba(255, 176, 32, 0.35)',
          text: COLORS.warningDark,
        }
      : tone === 'neutral'
      ? {
          bg: COLORS.surfaceElevated,
          border: COLORS.border,
          text: COLORS.textPrimary,
        }
      : {
          bg: COLORS.primarySoft,
          border: COLORS.primaryMuted,
          text: COLORS.primary,
        };

  return (
    <Animated.View style={[{transform: [{scale}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({pressed}) => [
          styles.button,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
          },
          pressed && styles.pressed,
        ]}>
        {icon ? <AppIcon name={icon} size={18} color={palette.text} /> : null}
        <Text style={[styles.label, {color: palette.text}]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: RADII.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default SecondaryButton;
