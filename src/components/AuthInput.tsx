import React, {useMemo, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {RADII, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

/**
 * Reusable form field with focus ring, password toggle, and error state.
 */
const AuthInput = ({
  label,
  error,
  isPassword = false,
  style,
  ...rest
}: AuthInputProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hidden, setHidden] = useState(isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          Boolean(error) && styles.inputError,
        ]}>
        <TextInput
          {...rest}
          secureTextEntry={hidden}
          placeholderTextColor={colors.textMuted}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden(prev => !prev)}
            style={styles.toggleButton}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            <Text style={styles.toggleText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: SPACING.md,
    },
    label: {
      ...TYPOGRAPHY.caption,
      color: colors.textSecondary,
      marginBottom: 6,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: RADII.md,
      borderWidth: 1.5,
      borderColor: colors.border,
      paddingHorizontal: SPACING.md,
      minHeight: 52,
    },
    inputFocused: {
      borderColor: colors.primary,
    },
    inputError: {
      borderColor: colors.error,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.textPrimary,
      paddingVertical: SPACING.sm,
    },
    toggleButton: {
      paddingLeft: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.primary,
    },
    errorText: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: '600',
      color: colors.errorDark,
    },
  });

export default AuthInput;
