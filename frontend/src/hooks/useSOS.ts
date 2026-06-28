import { useCallback, useEffect, useRef } from 'react';
import { useSafeRouteStore } from '../store/safeRouteStore';
import { buildLowBatteryMessage, buildSosMessage } from '../services/location';
import { cancelSosAlert, sendLowBatteryAlert, sendSosAlert } from '../services/twilio';
import type { LatLng } from '../services/routing';

const REPEAT_ALERT_MS = 120_000;

export function useSOS(location: LatLng | null) {
  const {
    sosActive,
    sosStealth,
    setSosActive,
    setSosStealth,
    contacts,
    userProfile,
    addAlertLog,
    permissions,
  } = useSafeRouteStore();

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const stopTracking = useCallback(() => {
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    if (repeatIntervalRef.current) clearInterval(repeatIntervalRef.current);
    locationIntervalRef.current = null;
    repeatIntervalRef.current = null;
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    document.body.style.filter = 'none';
    setSosStealth(false);
  }, [setSosStealth]);

  const broadcastLocation = useCallback(
    async (stealth = false) => {
      if (!location || !userProfile) return;
      await sendSosAlert({
        contacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
        userName: userProfile.name,
        lat: location.lat,
        lng: location.lng,
        stealth,
        message: buildSosMessage(userProfile.name, location.lat, location.lng),
      });
    },
    [contacts, location, userProfile]
  );

  const liveTrack = useCallback(async () => {
    if (!location) return;
    try {
      // POST to the websocket router so Sentinels see the dot move
      await fetch(`http://localhost:8000/api/track/update/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: location.lat, lng: location.lng })
      });
    } catch { /* optional */ }
  }, [location]);

  const triggerSOS = useCallback(
    async (stealth = false) => {
      setSosActive(true);
      setSosStealth(stealth);
      addAlertLog({ type: 'SOS' });

      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);

      if (stealth) document.body.style.filter = 'brightness(0.15)';

      if (permissions.microphone && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.start();
        } catch { /* optional */ }
      }

      // 1. Initial Broadcast SMS to contacts
      await broadcastLocation(stealth);

      // 2. Start Live WebSockets Tracking (every 5s)
      locationIntervalRef.current = setInterval(() => void liveTrack(), 5_000);
      
      // 3. Repeat SMS Alert (every 2 mins)
      repeatIntervalRef.current = setInterval(() => void broadcastLocation(stealth), REPEAT_ALERT_MS);
    },
    [addAlertLog, broadcastLocation, liveTrack, permissions.microphone, setSosActive, setSosStealth]
  );

  const deactivateSOS = useCallback(async () => {
    stopTracking();
    setSosActive(false);
    try {
      await cancelSosAlert();
    } catch { /* optional */ }
  }, [setSosActive, stopTracking]);

  useEffect(() => {
    const onLowBattery = async () => {
      if (!location || !userProfile || sosActive) return;
      const level = (navigator as Navigator & { getBattery?: () => Promise<{ level: number }> }).getBattery
        ? await (navigator as Navigator & { getBattery: () => Promise<{ level: number }> }).getBattery().then((b) => b.level)
        : 1;
      if (level < 0.15) {
        addAlertLog({ type: 'LowBattery' });
        await sendLowBatteryAlert({
          contacts: contacts.map((c) => ({ name: c.name, phone: c.phone })),
          userName: userProfile.name,
          lat: location.lat,
          lng: location.lng,
          message: buildLowBatteryMessage(userProfile.name, location.lat, location.lng),
        });
      }
    };
    const id = setInterval(() => void onLowBattery(), 60_000);
    return () => clearInterval(id);
  }, [addAlertLog, contacts, location, sosActive, userProfile]);

  useEffect(() => () => stopTracking(), [stopTracking]);

  return { sosActive, sosStealth, triggerSOS, deactivateSOS, stopTracking };
}
