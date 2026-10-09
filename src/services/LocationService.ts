import Geolocation, {
  type GeolocationResponse,
} from '@react-native-community/geolocation';

export const startLocationTracking = (
  onLocationUpdate: (location: GeolocationResponse) => void,
) => {
  const watchId = Geolocation.watchPosition(
    position => {
      onLocationUpdate(position);
    },
    error => {
      console.log('Location error:', error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 5,
      interval: 3000,
      fastestInterval: 2000,
    },
  );

  return watchId;
};

export const stopLocationTracking = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};