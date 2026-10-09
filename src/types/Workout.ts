export type WorkoutType = 'Walk' | 'Run';

export type StoredWorkout = {
  id: string;
  workoutType: WorkoutType;
  startedAt: number;
  finishedAt: number;
  elapsedTime: number;
  distance: number;
  gpsPointCount: number;
  averagePace: number | null;
  paceSecondsPerKm?: number | null;
  calories?: number | null;
  elevationGain?: number | null;
  userWeightKg?: number | null;
};