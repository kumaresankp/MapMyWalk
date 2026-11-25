import {GPSPoint} from '../utils/GPSUtils';

export const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

export const formatPace = (paceSecondsPerKm: number | null | undefined): string => {
  if (!paceSecondsPerKm || !Number.isFinite(paceSecondsPerKm) || paceSecondsPerKm <= 0) {
    return '—';
  }

  const totalSeconds = Math.round(paceSecondsPerKm);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export type RouteCameraView =
  | {
      mode: 'bounds';
      bounds: [number, number, number, number];
    }
  | {
      mode: 'center';
      center: [number, number];
    };

/**
 * Computes MapLibre camera framing from recorded GPS points without altering stored coordinates.
 */
export const computeRouteCameraView = (points: GPSPoint[]): RouteCameraView => {
  if (points.length === 0) {
    return {mode: 'center', center: [0, 0]};
  }

  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;
  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;

  for (const point of points) {
    if (point.longitude < minLng) minLng = point.longitude;
    if (point.longitude > maxLng) maxLng = point.longitude;
    if (point.latitude < minLat) minLat = point.latitude;
    if (point.latitude > maxLat) maxLat = point.latitude;
  }

  const lngSpan = maxLng - minLng;
  const latSpan = maxLat - minLat;

  if (lngSpan < 0.0002 && latSpan < 0.0002) {
    return {
      mode: 'center',
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
    };
  }

  return {
    mode: 'bounds',
    bounds: [minLng, minLat, maxLng, maxLat],
  };
};
