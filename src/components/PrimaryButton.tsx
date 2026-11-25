import React, {useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import {COLORS, RADII, SHADOWS, SPACING} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: AppIconName;
  variant?: 'primary' | 'danger' | 'success' | 'navy';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

/**
 * High-emphasis pill action button with Electric Lime primary fill and dark high-contrast label.
 */
const PrimaryButton = ({
  label,
  onPress,
  icon,
  variant = 'primary',
  style,
  disabled = false,
}: PrimaryButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const isLightText = variant === 'danger' || variant === 'navy';
  const bgColor =
    variant === 'danger'
      ? COLORS.error
      : variant === 'success'
      ? COLORS.accent
      : variant === 'navy'
      ? COLORS.surfaceElevated
      : COLORS.primary;

  const textColor = isLightText ? COLORS.textPrimary : COLORS.textOnPrimary;

  return (
    <Animated.View style={[{transform: [{scale}]}, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.97)}
        onPressOut={() => animateTo(1)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({pressed}) => [
          styles.button,
          {backgroundColor: bgColor},
          variant === 'navy' && styles.navyBorder,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}>
        {icon ? <AppIcon name={icon} size={18} color={textColor} /> : null}
        <Text style={[styles.label, {color: textColor}]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: RADII.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.button,
  },
  navyBorder: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

export default PrimaryButton;
