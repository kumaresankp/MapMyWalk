/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  createNavigationContainerRef: () => ({
    isReady: jest.fn(() => false),
    navigate: jest.fn(),
  }),
  useFocusEffect: () => undefined,
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
  AndroidImportance: {NONE: 0, MIN: 1, LOW: 2, DEFAULT: 3, HIGH: 4},
  EventType: {UNKNOWN: -1, DISMISSED: 0, PRESS: 1, ACTION_PRESS: 2},
  TriggerType: {TIMESTAMP: 0, INTERVAL: 1},
  RepeatFrequency: {NONE: -1, HOURLY: 0, DAILY: 1, WEEKLY: 2},
  AlarmType: {SET_AND_ALLOW_WHILE_IDLE: 1},
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
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: ({children}: {children: React.ReactNode}) => children,
  }),
}));

jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: {hide: jest.fn()},
}));

jest.mock('@maplibre/maplibre-react-native', () => ({
  Map: ({children}: {children?: React.ReactNode}) => children,
  Camera: ({children}: {children?: React.ReactNode}) => children,
  GeoJSONSource: ({children}: {children?: React.ReactNode}) => children,
  Layer: () => null,
  Marker: ({children}: {children?: React.ReactNode}) => children,
}));

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    watchPosition: jest.fn(),
    getCurrentPosition: jest.fn(),
    clearWatch: jest.fn(),
    setRNConfiguration: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
