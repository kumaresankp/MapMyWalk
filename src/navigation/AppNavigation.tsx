import React from 'react';
import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import BootSplash from 'react-native-bootsplash';

export type RootStackParamList = {
  Home: undefined;

  Workout: {
    workoutType: 'Walk' | 'Run';
  };

  WorkoutSummary: {
    workoutType: 'Walk' | 'Run';
    distance: number;
    elapsedTime: number;
    gpsPoints: any[];
    calories?: number | null;
    elevationGain?: number | null;
    averagePace?: number | null;
  };

  WorkoutHistory: undefined;

  WorkoutDetail: {
    workoutId: string;
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  return (
    <NavigationContainer
        onReady={() => {
          BootSplash.hide({fade: true});
        }}
      >
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}>

        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="Workout"
          component={WorkoutScreen}
        />

        <Stack.Screen
          name="WorkoutSummary"
          component={WorkoutSummaryScreen}
        />

        <Stack.Screen
          name="WorkoutHistory"
          component={WorkoutHistoryScreen}
        />

        <Stack.Screen
          name="WorkoutDetail"
          component={WorkoutDetailScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;