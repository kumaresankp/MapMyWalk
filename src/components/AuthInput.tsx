import React, {useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import {COLORS, RADII, SPACING, TYPOGRAPHY} from '../theme/theme';

type AuthInputProps = TextInputProps & {
  label: string;
  error?: string;
  isPassword?: boolean;
};

/**
 * Reusable form field with consistent MyWalkMap styling, password toggle, and error state.
 */
const AuthInput = ({
  label,
  error,
  isPassword = false,
  style,
  ...rest
}: AuthInputProps) => {
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
          placeholderTextColor={COLORS.textMuted}
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
    paddingVertical: SPACING.sm,
  },
  toggleButton: {
    paddingLeft: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.errorDark,
  },
});

export default AuthInput;
