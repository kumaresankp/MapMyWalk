import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  StoredWorkout,
} from '../types/Workout';

import {
  GPSPoint,
} from '../utils/GPSUtils';

const WORKOUTS_KEY = '@gps_fitness_workouts';

const ROUTE_PREFIX = '@gps_fitness_route_';

/*
 * Get all saved workouts
 */
export const getWorkouts =
  async (): Promise<StoredWorkout[]> => {
    try {
      const data =
        await AsyncStorage.getItem(WORKOUTS_KEY);

      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      console.log(
        'Error reading workouts:',
        error,
      );

      return [];
    }
  };

/*
 * Save completed workout
 */
export const saveWorkout = async (
  workout: StoredWorkout,
  gpsPoints: GPSPoint[],
): Promise<void> => {
  try {
    const existingWorkouts =
      await getWorkouts();

    const updatedWorkouts = [
      workout,
      ...existingWorkouts,
    ];

    await AsyncStorage.setItem(
      WORKOUTS_KEY,
      JSON.stringify(updatedWorkouts),
    );

    /*
     * Store route separately
     */
    await AsyncStorage.setItem(
      `${ROUTE_PREFIX}${workout.id}`,
      JSON.stringify(gpsPoints),
    );

    console.log(
      'Workout saved successfully:',
      workout.id,
    );
  } catch (error) {
    console.log(
      'Error saving workout:',
      error,
    );

    throw error;
  }
};

/*
 * Get one workout
 */
export const getWorkout = async (
  id: string,
): Promise<StoredWorkout | null> => {
  const workouts =
    await getWorkouts();

  return (
    workouts.find(
      workout => workout.id === id,
    ) ?? null
  );
};

/*
 * Get route points
 */
export const getWorkoutRoute =
  async (
    id: string,
  ): Promise<GPSPoint[]> => {
    try {
      const data =
        await AsyncStorage.getItem(
          `${ROUTE_PREFIX}${id}`,
        );

      if (!data) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      console.log(
        'Error reading route:',
        error,
      );

      return [];
    }
  };

/*
 * Delete workout
 */
export const deleteWorkout =
  async (
    id: string,
  ): Promise<void> => {
    try {
      const workouts =
        await getWorkouts();

      const updatedWorkouts =
        workouts.filter(
          workout => workout.id !== id,
        );

      await AsyncStorage.setItem(
        WORKOUTS_KEY,
        JSON.stringify(updatedWorkouts),
      );

      await AsyncStorage.removeItem(
        `${ROUTE_PREFIX}${id}`,
      );
    } catch (error) {
      console.log(
        'Error deleting workout:',
        error,
      );

      throw error;
    }
  };