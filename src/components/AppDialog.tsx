import React, {useMemo} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {useTheme} from '../context/ThemeContext';
import {RADII, SHADOWS, SPACING, ThemeColors, TYPOGRAPHY} from '../theme/theme';
import AppIcon, {AppIconName} from './AppIcon';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export type AppDialogTone = 'primary' | 'danger' | 'warning' | 'info';

export type AppDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  icon?: AppIconName;
  tone?: AppDialogTone;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Custom themed modal dialog replacing native Alert.alert popups.
 */
const AppDialog = ({
  visible,
  title,
  message,
  icon = 'alert',
  tone = 'primary',
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onCancel,
}: AppDialogProps) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const iconPalette =
    tone === 'danger'
      ? {bg: colors.errorSoft, fg: colors.error}
      : tone === 'warning'
      ? {bg: colors.warningSoft, fg: colors.warning}
      : {bg: colors.primarySoft, fg: colors.primary};

  const handleRequestClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleRequestClose}>
      <Pressable
        style={styles.backdrop}
        onPress={handleRequestClose}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog">
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.header}>
            <View
              style={[styles.iconCircle, {backgroundColor: iconPalette.bg}]}>
              <AppIcon name={icon} size={20} color={iconPalette.fg} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            {cancelLabel ? (
              <SecondaryButton
                label={cancelLabel}
                tone="neutral"
                onPress={handleRequestClose}
                style={styles.actionHalf}
              />
            ) : null}
            <PrimaryButton
              label={confirmLabel}
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={cancelLabel ? styles.actionHalf : styles.actionFull}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: RADII.xl,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...SHADOWS.floating,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    message: {
      ...TYPOGRAPHY.body,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: SPACING.lg,
    },
    actions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    actionHalf: {
      flex: 1,
    },
    actionFull: {
      flex: 1,
    },
  });

export default AppDialog;
