import { useEffect, useState, useRef } from 'react';

// Thresholds for anomaly detection
const SHAKE_THRESHOLD = 25; // m/s^2 - indicates violent shaking/running
const AUDIO_THRESHOLD = 85; // rough decibel equivalent mock

export function useSensorEngine() {
  const [kineticStress, setKineticStress] = useState(false);
  const [acousticThreat, setAcousticThreat] = useState(false);
  const [sensorsActive, setSensorsActive] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // 1. Kinetic Stress Detection (Gait & Tremor)
  useEffect(() => {
    if (!sensorsActive) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    
    const handleMotion = (e: DeviceMotionEvent) => {
      const { x, y, z } = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      if (x === null || y === null || z === null) return;
      
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      
      const speed = deltaX + deltaY + deltaZ;
      
      if (speed > SHAKE_THRESHOLD) {
        setKineticStress(true);
        // Reset after 3 seconds
        setTimeout(() => setKineticStress(false), 3000);
      }
      
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [sensorsActive]);

  // 2. Acoustic Threat Triangulation (Audio Spike Detection)
  useEffect(() => {
    if (!sensorsActive) {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      return;
    }

    const startAudioListener = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        micStreamRef.current = stream;
        
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const checkAudioLevels = () => {
          if (!analyserRef.current || !sensorsActive) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / dataArray.length;
          
          if (averageVolume > AUDIO_THRESHOLD) {
            setAcousticThreat(true);
            setTimeout(() => setAcousticThreat(false), 3000);
          }
          
          requestAnimationFrame(checkAudioLevels);
        };
        
        checkAudioLevels();
      } catch (err) {
        console.warn("SensorEngine: Audio permission denied or not available.", err);
      }
    };

    startAudioListener();

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [sensorsActive]);

  return {
    kineticStress,
    acousticThreat,
    sensorsActive,
    setSensorsActive
  };
}
