export type GPSPoint = {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
};

const MAX_ACCURACY = 30; // meters
const MAX_SPEED = 12; // m/s ≈ 43 km/h
const MIN_DISTANCE = 3; // meters

export const calculateDistance = (
  point1: GPSPoint,
  point2: GPSPoint,
): number => {
  const R = 6371000;

  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;

  const deltaLat =
    ((point2.latitude - point1.latitude) * Math.PI) / 180;

  const deltaLon =
    ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const isValidGPSPoint = (
  previousPoint: GPSPoint | null,
  newPoint: GPSPoint,
): boolean => {
  if (!Number.isFinite(newPoint.latitude) || !Number.isFinite(newPoint.longitude)) {
    return false;
  }

  if (newPoint.accuracy > MAX_ACCURACY) {
    return false;
  }

  if (!previousPoint) {
    return true;
  }

  const distance = calculateDistance(previousPoint, newPoint);

  if (distance < MIN_DISTANCE) {
    return false;
  }

  const timeDifference = (newPoint.timestamp - previousPoint.timestamp) / 1000;

  if (timeDifference <= 0) {
    return false;
  }

  const calculatedSpeed = distance / timeDifference;

  if (calculatedSpeed > MAX_SPEED) {
    return false;
  }

  return true;
};