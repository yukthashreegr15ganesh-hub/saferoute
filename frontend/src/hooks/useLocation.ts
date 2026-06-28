import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '../services/routing';

/** Default map center when GPS is denied, slow, or unavailable */
export const DEFAULT_LOCATION: LatLng = { lat: 28.6139, lng: 77.209 };

const GEO_OPTIONS_FAST: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 6000,
  maximumAge: 120000,
};

const GEO_OPTIONS_WATCH: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10000,
  maximumAge: 30000,
};

export const useLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const resolvedRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);
  const hardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (hardTimeoutRef.current) {
      clearTimeout(hardTimeoutRef.current);
      hardTimeoutRef.current = null;
    }
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const applyFallback = useCallback((message: string) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    setLocation(DEFAULT_LOCATION);
    setUsingFallback(true);
    setError(message);
    setIsLoading(false);
  }, []);

  const resolveLocation = useCallback((coords: LatLng, fromFallback = false) => {
    resolvedRef.current = true;
    setLocation(coords);
    setUsingFallback(fromFallback);
    if (!fromFallback) setError(null);
    setIsLoading(false);
  }, []);

  const startTracking = useCallback(() => {
    cleanup();
    resolvedRef.current = false;
    setIsLoading(true);
    setError(null);
    setUsingFallback(false);
    setLocation(null);

    if (!('geolocation' in navigator)) {
      applyFallback('Geolocation is not supported — showing default map.');
      return;
    }

    hardTimeoutRef.current = setTimeout(() => {
      applyFallback('Location timed out — showing default map. Enable location for accuracy.');
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (hardTimeoutRef.current) {
          clearTimeout(hardTimeoutRef.current);
          hardTimeoutRef.current = null;
        }
        resolveLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        if (hardTimeoutRef.current) {
          clearTimeout(hardTimeoutRef.current);
          hardTimeoutRef.current = null;
        }
        applyFallback('Location access denied — showing default map.');
      },
      GEO_OPTIONS_FAST
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        resolveLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      undefined,
      GEO_OPTIONS_WATCH
    );
  }, [applyFallback, cleanup, resolveLocation]);

  useEffect(() => {
    startTracking();
    return cleanup;
  }, [startTracking, cleanup]);

  return {
    location,
    error,
    isLoading,
    usingFallback,
    retry: startTracking,
  };
};
