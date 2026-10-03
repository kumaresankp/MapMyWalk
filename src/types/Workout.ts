export type WorkoutType = 'Walk' | 'Run';

export type StoredWorkout = {
  id: string;
  workoutType: WorkoutType;
  startedAt: number;
  finishedAt: number;
  elapsedTime: number;
  distance: number;
  gpsPointCount: number;
  paceSecondsPerKm: number | null;
};