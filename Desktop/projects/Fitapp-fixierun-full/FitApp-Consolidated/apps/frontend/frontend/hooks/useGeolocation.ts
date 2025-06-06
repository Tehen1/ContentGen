import { useState, useEffect } from "react";

type GeolocationCoords = { latitude: number; longitude: number };
type GeolocationError =
  | "not-supported"
  | "permission-denied"
  | "policy-blocked"
  | "position-unavailable"
  | "timeout"
  | "unknown";

interface UseGeolocationResult {
  coords: GeolocationCoords | null;
  error: GeolocationError | null;
  loading: boolean;
}

export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("not-supported");
      setLoading(false);
      return;
    }


    const onSuccess = (position: GeolocationPosition) => {
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setError(null);
      setLoading(false);
    };

    const onError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError("permission-denied");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("position-unavailable");
          break;
        case err.TIMEOUT:
          setError("timeout");
          break;
        default:
          setError("unknown");
      }
      setCoords(null);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    // Clean up: nothing for single getCurrentPosition
    // For watchPosition, you would clear watcher here.
  }, []);

  return { coords, error, loading };
}

/** Usage in component:
  const { coords, error, loading } = useGeolocation();

  if (loading) return <span>Loading geolocation...</span>;
  if (error) {
    if (error === "policy-blocked")
      return <span>Geolocation is disabled by browser policy.</span>;
    if (error === "permission-denied")
      return <span>Please enable location permissions in your browser.</span>;
    // Handle other errors as desired
  }
  return <div>Lat: {coords?.latitude}, Lon: {coords?.longitude}</div>;
*/