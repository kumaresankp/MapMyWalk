/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  useFocusEffect: () => undefined,
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
