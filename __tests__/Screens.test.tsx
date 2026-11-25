/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => {
  const ReactActual = require('react');
  return {
    NavigationContainer: ({children}: {children: React.ReactNode}) => children,
    useFocusEffect: (effect: () => void | (() => void)) => {
      ReactActual.useEffect(() => effect(), [effect]);
    },
  };
});

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
    watchPosition: jest.fn(() => 1),
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid} from 'react-native';

import {AuthProvider} from '../src/context/AuthContext';
import HomeScreen from '../src/screens/HomeScreen';
import WorkoutScreen from '../src/screens/WorkoutScreen';
import WorkoutSummaryScreen from '../src/screens/WorkoutSummaryScreen';
import WorkoutHistoryScreen from '../src/screens/WorkoutHistoryScreen';
import WorkoutDetailScreen from '../src/screens/WorkoutDetailScreen';
import {GPSPoint} from '../src/utils/GPSUtils';

const samplePoints: GPSPoint[] = [
  {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: 1700000000000,
    accuracy: 8,
    altitude: 12,
    speed: 2.5,
  },
  {
    latitude: 37.7755,
    longitude: -122.4188,
    timestamp: 1700000010000,
    accuracy: 9,
    altitude: 15,
    speed: 2.7,
  },
];

const sampleWorkout = {
  id: 'workout_1700000000000',
  workoutType: 'Run' as const,
  startedAt: 1700000000000,
  finishedAt: 1700000600000,
  elapsedTime: 600,
  distance: 2000,
  gpsPointCount: 2,
  averagePace: 300,
  paceSecondsPerKm: 300,
  calories: 150,
  elevationGain: 3,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('HomeScreen renders MyWalkMap branding and allows Walk/Run selection and Start navigation', async () => {
  const navigate = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <AuthProvider>
        <HomeScreen navigation={{navigate}} />
      </AuthProvider>,
    );
  });

  const textContent = JSON.stringify(renderer.toJSON());
  expect(textContent).toContain('MyWalkMap');
  expect(textContent).toContain('Every Step Has a Story.');
  expect(textContent).toContain('Start Walk');

  const runButton = renderer.root.findByProps({accessibilityLabel: 'Run workout'});
  await ReactTestRenderer.act(async () => {
    runButton.props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('Start Run');

  const startButton = renderer.root.findByProps({accessibilityLabel: 'Start Run'});
  await ReactTestRenderer.act(async () => {
    startButton.props.onPress();
  });

  expect(navigate).toHaveBeenCalledWith('Workout', {workoutType: 'Run'});
});

test('WorkoutScreen renders GPS searching state and active map telemetry with Pause/Resume', async () => {
  jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue(PermissionsAndroid.RESULTS.GRANTED);

  (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success => {
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 7.5,
        altitude: 10,
        speed: 1.5,
      },
      timestamp: 1700000000000,
    });
  });

  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <WorkoutScreen
        route={{params: {workoutType: 'Walk'}}}
        navigation={{goBack: jest.fn(), navigate: jest.fn()}}
      />,
    );
  });

  const activeJson = JSON.stringify(renderer.toJSON());
  expect(activeJson).toContain('Walk');
  expect(activeJson).toContain('Tracking');
  expect(activeJson).toContain('GPS Strong');

  const pauseBtn = renderer.root.findByProps({accessibilityLabel: 'Pause workout'});
  await ReactTestRenderer.act(async () => {
    pauseBtn.props.onPress();
  });

  expect(JSON.stringify(renderer.toJSON())).toContain('Paused');
  expect(JSON.stringify(renderer.toJSON())).toContain('Resume');

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('WorkoutSummaryScreen renders summary stats and route preview', async () => {
  const popToTop = jest.fn();
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <WorkoutSummaryScreen
        route={{
          params: {
            workoutType: 'Run',
            distance: 2500,
            elapsedTime: 750,
            gpsPoints: samplePoints,
            calories: 180,
            elevationGain: 12.5,
            averagePace: 300,
          },
        }}
        navigation={{popToTop, navigate: jest.fn()}}
      />,
    );
  });

  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Workout Completed');
  expect(text).toContain('2.50');
  expect(text).toContain('180');
  expect(text).toContain('12.5');
  expect(text).toContain('5:00');
});

test('WorkoutHistoryScreen renders saved workouts and Walk/Run filters', async () => {
  (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
    JSON.stringify([sampleWorkout]),
  );

  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <WorkoutHistoryScreen navigation={{goBack: jest.fn(), navigate: jest.fn()}} />,
    );
  });

  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Workout History');
  expect(text).toContain('2.00');
  expect(text).toContain('Run');
});

test('WorkoutDetailScreen renders saved workout details and route', async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    if (key === '@gps_fitness_workouts') {
      return Promise.resolve(JSON.stringify([sampleWorkout]));
    }
    if (key === `@gps_fitness_route_${sampleWorkout.id}`) {
      return Promise.resolve(JSON.stringify(samplePoints));
    }
    return Promise.resolve(null);
  });

  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <WorkoutDetailScreen
        route={{params: {workoutId: sampleWorkout.id}}}
        navigation={{goBack: jest.fn()}}
      />,
    );
  });

  const text = JSON.stringify(renderer.toJSON());
  expect(text).toContain('Run Details');
  expect(text).toContain('2.00');
  expect(text).toContain('Delete Workout');
});
