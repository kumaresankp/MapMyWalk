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
  };
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  return (
    <NavigationContainer>
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

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;