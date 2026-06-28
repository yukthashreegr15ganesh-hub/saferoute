import { useCallback, useEffect, useRef, useState } from 'react';
import type { RouteInstruction, LatLng } from '../services/routing';
import { distanceMeters } from '../services/location';

export const useVoiceNav = (
  instructions: RouteInstruction[],
  isActive: boolean,
  routePoints: [number, number][] = [],
  userLocation: LatLng | null = null
) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const lastPosRef = useRef<LatLng | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) synthRef.current = window.speechSynthesis;
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = synthRef.current.getVoices();
    const voice = voices.find((v) => v.lang.startsWith('en')) ?? voices[0];
    if (voice) u.voice = voice;
    u.rate = 0.92;
    synthRef.current.speak(u);
  }, []);

  useEffect(() => {
    if (!isActive || instructions.length === 0) return;
    setCurrentStepIndex(0);
    speak(`Starting navigation. ${instructions[0].text}`);
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isActive || !userLocation || routePoints.length < 2) return;
    const nearest = routePoints.reduce((best, p, i) => {
      const d = distanceMeters(userLocation, { lat: p[0], lng: p[1] });
      return d < best.d ? { d, i } : best;
    }, { d: Infinity, i: 0 });
    if (nearest.i > currentStepIndex && nearest.i < instructions.length) {
      setCurrentStepIndex(nearest.i);
      speak(instructions[nearest.i].text);
    }
    lastPosRef.current = userLocation;
  }, [userLocation, isActive, routePoints, instructions, currentStepIndex, speak]);

  const nextInstruction = useCallback(() => {
    if (currentStepIndex < instructions.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      speak(instructions[next].text);
    } else {
      speak('You have arrived at your destination.');
    }
  }, [currentStepIndex, instructions, speak]);

  const repeatInstruction = useCallback(() => {
    if (instructions[currentStepIndex]) speak(instructions[currentStepIndex].text);
  }, [currentStepIndex, instructions, speak]);

  const stopNavigation = useCallback(() => {
    synthRef.current?.cancel();
    setCurrentStepIndex(0);
    speak('Navigation ended.');
  }, [speak]);

  return {
    currentInstruction: instructions[currentStepIndex],
    currentStepIndex,
    totalSteps: instructions.length,
    nextInstruction,
    repeatInstruction,
    speak,
    stopNavigation,
  };
};
