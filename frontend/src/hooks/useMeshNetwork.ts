import { useState, useEffect } from 'react';

export function useMeshNetwork() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [meshActive, setMeshActive] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMeshActive(false);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setMeshActive(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, meshActive };
}
