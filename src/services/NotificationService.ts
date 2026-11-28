import {PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import {
  validateWalkingReminderConfig,
  walkingReminderConfig,
  WalkingReminderConfig,
} from '../config/walkingReminderConfig';

export const WALKING_REMINDER_CHANNEL_ID = 'walking-reminders';
export const WALKING_REMINDER_CHANNEL_NAME = 'Walking Reminders';
export const WALKING_REMINDER_ID = 'daily-walking-reminder';

const PERMISSION_PROMPTED_KEY = '@mywalkmap_notification_permission_prompted';
const REMINDER_META_KEY = '@mywalkmap_walking_reminder_meta';

type ReminderMeta = {
  signature: string;
  scheduledAt: number;
};

let syncInFlight: Promise<boolean> | null = null;

/**
 * Computes the next local timestamp (ms) for the given 24-hour time.
 * Uses local Date methods so device timezone & DST transitions are respected.
 */
export const computeNextReminderTimestamp = (
  hour: number,
  minute: number,
  now: Date = new Date(),
): number => {
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0,
  );
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime();
};

const pickReminderMessage = (messages: string[], now: Date = new Date()): string => {
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86400000,
  );
  return messages[dayOfYear % messages.length];
};

const buildConfigSignature = (config: WalkingReminderConfig): string => {
  const timeZone =
    typeof Intl !== 'undefined' && Intl.DateTimeFormat
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'
      : 'local';
  const offset = new Date().getTimezoneOffset();
  return JSON.stringify({
    enabled: config.enabled,
    hour: config.hour,
    minute: config.minute,
    title: config.title,
    timeZone,
    offset,
  });
};

/**
 * Ensures the "Walking Reminders" Android notification channel exists.
 */
export const ensureWalkingReminderChannel = async (): Promise<string> => {
  return notifee.createChannel({
    id: WALKING_REMINDER_CHANNEL_ID,
    name: WALKING_REMINDER_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
};

/**
 * Checks or requests notification permission without repeatedly prompting after denial.
 */
export const ensureNotificationPermission = async (): Promise<boolean> => {
  const currentSettings = await notifee.getNotificationSettings();
  if (
    currentSettings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    currentSettings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const alreadyPrompted = await AsyncStorage.getItem(PERMISSION_PROMPTED_KEY);
  if (alreadyPrompted === 'true') {
    return false;
  }

  await AsyncStorage.setItem(PERMISSION_PROMPTED_KEY, 'true');

  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const requested = await notifee.requestPermission();
  return (
    requested.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    requested.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
};

/**
 * Cancels any existing daily walking reminder and clears stored scheduling metadata.
 */
export const cancelWalkingReminder = async (): Promise<void> => {
  await notifee.cancelTriggerNotification(WALKING_REMINDER_ID);
  await AsyncStorage.removeItem(REMINDER_META_KEY);
};

/**
 * Synchronizes the daily local walking reminder with `walkingReminderConfig`.
 * Safe to call on app startup and whenever the app returns to the foreground.
 */
export const syncWalkingReminder = async (
  config: WalkingReminderConfig = walkingReminderConfig,
): Promise<boolean> => {
  if (syncInFlight) {
    return syncInFlight;
  }

  syncInFlight = (async () => {
    try {
      const validated = validateWalkingReminderConfig(config);

      if (!validated.enabled) {
        await cancelWalkingReminder();
        return false;
      }

      const hasPermission = await ensureNotificationPermission();
      if (!hasPermission) {
        await cancelWalkingReminder();
        return false;
      }

      await ensureWalkingReminderChannel();

      const signature = buildConfigSignature(validated);
      const [existingIds, rawMeta] = await Promise.all([
        notifee.getTriggerNotificationIds(),
        AsyncStorage.getItem(REMINDER_META_KEY),
      ]);

      if (existingIds.includes(WALKING_REMINDER_ID) && rawMeta) {
        try {
          const parsed = JSON.parse(rawMeta) as ReminderMeta;
          if (parsed.signature === signature) {
            return true;
          }
        } catch {
          // Malformed metadata; proceed to reschedule cleanly
        }
      }

      // Cancel previous scheduled reminder before creating a new one to avoid duplicates
      await notifee.cancelTriggerNotification(WALKING_REMINDER_ID);

      const now = new Date();
      const timestamp = computeNextReminderTimestamp(
        validated.hour,
        validated.minute,
        now,
      );
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp,
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {
          type: AlarmType.SET_AND_ALLOW_WHILE_IDLE,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: WALKING_REMINDER_ID,
          title: validated.title,
          body: pickReminderMessage(validated.messages, now),
          data: {
            type: 'walking_reminder',
            targetScreen: 'Home',
          },
          android: {
            channelId: WALKING_REMINDER_CHANNEL_ID,
            smallIcon: 'ic_launcher',
            sound: 'default',
            pressAction: {
              id: 'default',
            },
          },
        },
        trigger,
      );

      const meta: ReminderMeta = {
        signature,
        scheduledAt: timestamp,
      };
      await AsyncStorage.setItem(REMINDER_META_KEY, JSON.stringify(meta));
      return true;
    } catch (error) {
      console.warn('Failed to sync walking reminder:', error);
      return false;
    } finally {
      syncInFlight = null;
    }
  })();

  return syncInFlight;
};

/**
 * Registers Notifee background event handler (required for killed/background states).
 */
export const registerNotificationBackgroundHandler = (): void => {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    if (
      type === EventType.PRESS &&
      detail.notification?.id === WALKING_REMINDER_ID
    ) {
      // Pressing the notification opens the app; cold-start/foreground routing handles Home navigation.
    }
  });
};

/**
 * Checks if a notification event represents a tap on the walking reminder.
 */
export const isWalkingReminderPress = (
  type: EventType,
  notificationId?: string,
  data?: Record<string, string | object | number>,
): boolean => {
  if (type !== EventType.PRESS) {
    return false;
  }
  return (
    notificationId === WALKING_REMINDER_ID ||
    data?.type === 'walking_reminder'
  );
};
