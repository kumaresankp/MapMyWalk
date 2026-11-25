import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';

import {useAuth} from '../context/AuthContext';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SignUpScreen from '../screens/SignUpScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';
import WorkoutHistoryScreen from '../screens/WorkoutHistoryScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  Home: undefined;
  Profile: undefined;

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

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigation = () => {
  const {isAuthenticated, isGuest, isLoading} = useAuth();
  const [navReady, setNavReady] = useState(false);
  const splashHiddenRef = useRef(false);

  useEffect(() => {
    if (navReady && !isLoading && !splashHiddenRef.current) {
      splashHiddenRef.current = true;
      BootSplash.hide({fade: true});
    }
  }, [navReady, isLoading]);

  const canEnterApp = isAuthenticated || isGuest;

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer onReady={() => setNavReady(true)}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {canEnterApp ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Workout" component={WorkoutScreen} />
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
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
