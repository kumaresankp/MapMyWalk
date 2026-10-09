import {GPSPoint} from './GPSUtils';

export type CalorieEstimateInput = {
  workoutType: 'Walk' | 'Run';
  durationSeconds: number;
  distanceMeters: number;
  weightKg?: number;
  gpsPoints?: GPSPoint[];
};

const DEFAULT_WEIGHT_KG = 70;

export const estimateCalories = ({
  workoutType,
  durationSeconds,
  distanceMeters,
  weightKg = DEFAULT_WEIGHT_KG,
}: CalorieEstimateInput): number => {
  const safeDurationSeconds = Math.max(0, Number.isFinite(durationSeconds) ? durationSeconds : 0);
  const safeDistanceMeters = Math.max(0, Number.isFinite(distanceMeters) ? distanceMeters : 0);
  const safeWeightKg = Math.max(20, Number.isFinite(weightKg) ? weightKg : DEFAULT_WEIGHT_KG);

  if (safeDurationSeconds <= 0 && safeDistanceMeters <= 0) {
    return 0;
  }

  const durationHours = safeDurationSeconds / 3600;
  const met = workoutType === 'Run' ? 9.8 : 3.5;

  const durationBased = met * safeWeightKg * durationHours;
  const distanceBased = safeDistanceMeters > 0 ? (safeWeightKg * 0.035 * (safeDistanceMeters / 1000)) : 0;

  return Math.max(0, Math.round(durationBased + distanceBased));
};
