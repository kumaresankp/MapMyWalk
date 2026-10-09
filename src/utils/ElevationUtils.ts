import {GPSPoint} from './GPSUtils';

const MAX_ELEVATION_DELTA = 15;

export const calculateElevationGain = (
  points: GPSPoint[],
  maxDeltaMeters = MAX_ELEVATION_DELTA,
): number | null => {
  if (!Array.isArray(points) || points.length < 2) {
    return null;
  }

  let totalGain = 0;
  let previousAltitude: number | null = null;

  for (const point of points) {
    const altitude = point.altitude;

    if (altitude == null || !Number.isFinite(altitude)) {
      previousAltitude = null;
      continue;
    }

    if (previousAltitude == null) {
      previousAltitude = altitude;
      continue;
    }

    const delta = altitude - previousAltitude;

    if (Math.abs(delta) > maxDeltaMeters) {
      previousAltitude = altitude;
      continue;
    }

    if (delta > 0) {
      totalGain += delta;
    }

    previousAltitude = altitude;
  }

  return totalGain > 0 ? Number(totalGain.toFixed(1)) : 0;
};
