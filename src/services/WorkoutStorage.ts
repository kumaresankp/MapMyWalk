import AsyncStorage from '@react-native-async-storage/async-storage';

import {StoredWorkout} from '../types/Workout';
import {GPSPoint} from '../utils/GPSUtils';

const WORKOUTS_KEY = '@gps_fitness_workouts';
const ROUTE_PREFIX = '@gps_fitness_route_';

const normalizeWorkout = (workout: Partial<StoredWorkout>): StoredWorkout => {
  const distance = Number(workout.distance ?? 0);
  const elapsedTime = Number(workout.elapsedTime ?? 0);
  const gpsPointCount = Number(workout.gpsPointCount ?? 0);
  const paceSecondsPerKm =
    workout.averagePace ?? workout.paceSecondsPerKm ?? null;

  return {
    id: workout.id ?? `workout_${Date.now()}`,
    workoutType: workout.workoutType === 'Run' ? 'Run' : 'Walk',
    startedAt: Number(workout.startedAt ?? Date.now()),
    finishedAt: Number(workout.finishedAt ?? Date.now()),
    elapsedTime,
    distance,
    gpsPointCount: Number.isFinite(gpsPointCount) ? gpsPointCount : 0,
    averagePace: Number.isFinite(Number(paceSecondsPerKm)) ? Number(paceSecondsPerKm) : null,
    paceSecondsPerKm:
      Number.isFinite(Number(paceSecondsPerKm)) ? Number(paceSecondsPerKm) : null,
    calories: workout.calories ?? null,
    elevationGain: workout.elevationGain ?? null,
    userWeightKg: workout.userWeightKg ?? null,
  };
};

export const getWorkouts = async (): Promise<StoredWorkout[]> => {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const workouts = parsed.map(item => normalizeWorkout(item as Partial<StoredWorkout>));

    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

    return workouts;
  } catch (error) {
    console.log('Error reading workouts:', error);
    return [];
  }
};

export const saveWorkout = async (
  workout: StoredWorkout,
  gpsPoints: GPSPoint[],
): Promise<void> => {
  try {
    const normalizedWorkout = normalizeWorkout(workout);
    const existingWorkouts = await getWorkouts();
    const updatedWorkouts = [normalizedWorkout, ...existingWorkouts.filter(item => item.id !== normalizedWorkout.id)];

    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
    await AsyncStorage.setItem(`${ROUTE_PREFIX}${normalizedWorkout.id}`, JSON.stringify(gpsPoints));
  } catch (error) {
    console.log('Error saving workout:', error);
    throw error;
  }
};

export const getWorkout = async (id: string): Promise<StoredWorkout | null> => {
  const workouts = await getWorkouts();
  return workouts.find(workout => workout.id === id) ?? null;
};

export const getWorkoutRoute = async (id: string): Promise<GPSPoint[]> => {
  try {
    const data = await AsyncStorage.getItem(`${ROUTE_PREFIX}${id}`);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log('Error reading route:', error);
    return [];
  }
};

export const deleteWorkout = async (id: string): Promise<void> => {
  try {
    const workouts = await getWorkouts();
    const updatedWorkouts = workouts.filter(workout => workout.id !== id);

    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(updatedWorkouts));
    await AsyncStorage.removeItem(`${ROUTE_PREFIX}${id}`);
  } catch (error) {
    console.log('Error deleting workout:', error);
    throw error;
  }
};