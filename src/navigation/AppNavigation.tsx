import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import notifee, {EventType} from '@notifee/react-native';
import BootSplash from 'react-native-bootsplash';

import {useAuth} from '../context/AuthContext';
import {
  isWalkingReminderPress,
  syncWalkingReminder,
  WALKING_REMINDER_ID,
} from '../services/NotificationService';
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
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const AppNavigation = () => {
  const {isAuthenticated, isGuest, isLoading} = useAuth();
  const [navReady, setNavReady] = useState(false);
  const splashHiddenRef = useRef(false);
  const pendingHomeFromNotificationRef = useRef(false);

  const canEnterApp = isAuthenticated || isGuest;

  const navigateHomeSafely = useCallback(() => {
    if (canEnterApp && navReady && navigationRef.isReady()) {
      pendingHomeFromNotificationRef.current = false;
      navigationRef.navigate('Home');
      return true;
    }
    pendingHomeFromNotificationRef.current = true;
    return false;
  }, [canEnterApp, navReady]);

  useEffect(() => {
    if (navReady && !isLoading && !splashHiddenRef.current) {
      splashHiddenRef.current = true;
      BootSplash.hide({fade: true});
    }
  }, [navReady, isLoading]);

  useEffect(() => {
    if (pendingHomeFromNotificationRef.current && canEnterApp && navReady) {
      navigateHomeSafely();
    }
  }, [canEnterApp, navReady, navigateHomeSafely]);

  useEffect(() => {
    syncWalkingReminder();

    const appStateSub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncWalkingReminder();
      }
    });

    notifee
      .getInitialNotification()
      .then(initial => {
        if (
          initial &&
          isWalkingReminderPress(
            EventType.PRESS,
            initial.notification?.id,
            initial.notification?.data,
          )
        ) {
          navigateHomeSafely();
        }
      })
      .catch(() => {});

    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      if (
        isWalkingReminderPress(
          type,
          detail.notification?.id ?? WALKING_REMINDER_ID,
          detail.notification?.data,
        ) &&
        type === EventType.PRESS
      ) {
        navigateHomeSafely();
      }
    });

    return () => {
      appStateSub.remove();
      unsubscribeNotifee();
    };
  }, [navigateHomeSafely]);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setNavReady(true)}>
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
