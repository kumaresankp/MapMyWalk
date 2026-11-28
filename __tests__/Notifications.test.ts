import {PermissionsAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AlarmType,
  AndroidImportance,
  AuthorizationStatus,
  EventType,
  RepeatFrequency,
  TriggerType,
} from '@notifee/react-native';

import {
  validateWalkingReminderConfig,
  walkingReminderConfig,
} from '../src/config/walkingReminderConfig';
import {
  cancelWalkingReminder,
  computeNextReminderTimestamp,
  isWalkingReminderPress,
  syncWalkingReminder,
  WALKING_REMINDER_CHANNEL_ID,
  WALKING_REMINDER_CHANNEL_NAME,
  WALKING_REMINDER_ID,
} from '../src/services/NotificationService';

jest.mock('@notifee/react-native', () => {
  const actualTypes = jest.requireActual('@notifee/react-native/dist/types/Trigger');
  const actualNotifTypes = jest.requireActual(
    '@notifee/react-native/dist/types/Notification',
  );
  return {
    __esModule: true,
    ...actualTypes,
    ...actualNotifTypes,
    AuthorizationStatus: {
      NOT_DETERMINED: -1,
      DENIED: 0,
      AUTHORIZED: 1,
      PROVISIONAL: 2,
    },
    AndroidImportance: {
      NONE: 0,
      MIN: 1,
      LOW: 2,
      DEFAULT: 3,
      HIGH: 4,
    },
    EventType: {
      UNKNOWN: -1,
      DISMISSED: 0,
      PRESS: 1,
      ACTION_PRESS: 2,
      DELIVERED: 3,
    },
    default: {
      createChannel: jest.fn().mockResolvedValue('walking-reminders'),
      getNotificationSettings: jest.fn().mockResolvedValue({
        authorizationStatus: 1,
      }),
      requestPermission: jest.fn().mockResolvedValue({
        authorizationStatus: 1,
      }),
      getTriggerNotificationIds: jest.fn().mockResolvedValue([]),
      cancelTriggerNotification: jest.fn().mockResolvedValue(undefined),
      createTriggerNotification: jest.fn().mockResolvedValue('daily-walking-reminder'),
      onForegroundEvent: jest.fn(() => jest.fn()),
      onBackgroundEvent: jest.fn(),
      getInitialNotification: jest.fn().mockResolvedValue(null),
    },
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store.get(key) ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: jest.fn(async (key: string) => {
        store.delete(key);
      }),
      __clear: () => store.clear(),
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage as unknown as {__clear: () => void}).__clear();
  (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
    authorizationStatus: AuthorizationStatus.AUTHORIZED,
  });
  (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([]);
});

describe('walkingReminderConfig validation', () => {
  test('default config is valid 24-hour config', () => {
    expect(() => validateWalkingReminderConfig(walkingReminderConfig)).not.toThrow();
    expect(walkingReminderConfig.hour).toBeGreaterThanOrEqual(0);
    expect(walkingReminderConfig.hour).toBeLessThanOrEqual(23);
    expect(walkingReminderConfig.minute).toBeGreaterThanOrEqual(0);
    expect(walkingReminderConfig.minute).toBeLessThanOrEqual(59);
  });

  test('rejects invalid hour or minute', () => {
    expect(() =>
      validateWalkingReminderConfig({...walkingReminderConfig, hour: 24}),
    ).toThrow();
    expect(() =>
      validateWalkingReminderConfig({...walkingReminderConfig, hour: -1}),
    ).toThrow();
    expect(() =>
      validateWalkingReminderConfig({...walkingReminderConfig, minute: 60}),
    ).toThrow();
    expect(() =>
      validateWalkingReminderConfig({...walkingReminderConfig, minute: 12.5}),
    ).toThrow();
  });
});

describe('computeNextReminderTimestamp', () => {
  test('schedules today when target time is in the future', () => {
    const now = new Date(2026, 10, 26, 6, 0, 0, 0);
    const ts = computeNextReminderTimestamp(6, 30, now);
    const scheduled = new Date(ts);
    expect(scheduled.getFullYear()).toBe(2026);
    expect(scheduled.getMonth()).toBe(10);
    expect(scheduled.getDate()).toBe(26);
    expect(scheduled.getHours()).toBe(6);
    expect(scheduled.getMinutes()).toBe(30);
  });

  test('schedules tomorrow when target time has already passed today', () => {
    const now = new Date(2026, 10, 26, 7, 0, 0, 0);
    const ts = computeNextReminderTimestamp(6, 30, now);
    const scheduled = new Date(ts);
    expect(scheduled.getDate()).toBe(27);
    expect(scheduled.getHours()).toBe(6);
    expect(scheduled.getMinutes()).toBe(30);
  });
});

describe('NotificationService', () => {
  test('creates channel, cancels previous reminder, and schedules daily inexact trigger', async () => {
    const result = await syncWalkingReminder({
      ...walkingReminderConfig,
      enabled: true,
      hour: 6,
      minute: 30,
    });

    expect(result).toBe(true);
    expect(notifee.createChannel).toHaveBeenCalledWith({
      id: WALKING_REMINDER_CHANNEL_ID,
      name: WALKING_REMINDER_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
      sound: 'default',
    });
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(
      WALKING_REMINDER_ID,
    );
    expect(notifee.createTriggerNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: WALKING_REMINDER_ID,
        title: walkingReminderConfig.title,
        data: {type: 'walking_reminder', targetScreen: 'Home'},
        android: expect.objectContaining({
          channelId: WALKING_REMINDER_CHANNEL_ID,
          sound: 'default',
        }),
      }),
      expect.objectContaining({
        type: TriggerType.TIMESTAMP,
        repeatFrequency: RepeatFrequency.DAILY,
        alarmManager: {type: AlarmType.SET_AND_ALLOW_WHILE_IDLE},
      }),
    );
  });

  test('skips duplicate rescheduling when signature and trigger already match', async () => {
    await syncWalkingReminder(walkingReminderConfig);
    expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(1);

    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      WALKING_REMINDER_ID,
    ]);
    await syncWalkingReminder(walkingReminderConfig);
    expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(1);
  });

  test('reschedules when hour or minute changes in config', async () => {
    await syncWalkingReminder({
      ...walkingReminderConfig,
      hour: 6,
      minute: 30,
    });
    (notifee.getTriggerNotificationIds as jest.Mock).mockResolvedValue([
      WALKING_REMINDER_ID,
    ]);

    await syncWalkingReminder({
      ...walkingReminderConfig,
      hour: 7,
      minute: 15,
    });
    expect(notifee.createTriggerNotification).toHaveBeenCalledTimes(2);
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledTimes(2);
  });

  test('cancels reminder when enabled is false', async () => {
    const result = await syncWalkingReminder({
      ...walkingReminderConfig,
      enabled: false,
    });

    expect(result).toBe(false);
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(
      WALKING_REMINDER_ID,
    );
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  });

  test('does not repeatedly prompt after permission denial', async () => {
    const originalOS = Platform.OS;
    const originalVersion = Platform.Version;
    Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
    Object.defineProperty(Platform, 'Version', {value: 34, configurable: true});

    (notifee.getNotificationSettings as jest.Mock).mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    });
    (notifee.requestPermission as jest.Mock).mockResolvedValue({
      authorizationStatus: AuthorizationStatus.DENIED,
    });
    const requestSpy = jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    const first = await syncWalkingReminder(walkingReminderConfig);
    const second = await syncWalkingReminder(walkingReminderConfig);

    expect(first).toBe(false);
    expect(second).toBe(false);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();

    requestSpy.mockRestore();
    Object.defineProperty(Platform, 'OS', {value: originalOS, configurable: true});
    Object.defineProperty(Platform, 'Version', {
      value: originalVersion,
      configurable: true,
    });
  });

  test('identifies walking reminder press events', () => {
    expect(
      isWalkingReminderPress(EventType.PRESS, WALKING_REMINDER_ID, undefined),
    ).toBe(true);
    expect(
      isWalkingReminderPress(EventType.PRESS, 'other', {
        type: 'walking_reminder',
      }),
    ).toBe(true);
    expect(
      isWalkingReminderPress(EventType.DISMISSED, WALKING_REMINDER_ID, undefined),
    ).toBe(false);
  });

  test('cancelWalkingReminder cancels trigger and removes metadata', async () => {
    await cancelWalkingReminder();
    expect(notifee.cancelTriggerNotification).toHaveBeenCalledWith(
      WALKING_REMINDER_ID,
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });
});
