import { Car, Bus, Train, Footprints, CarFront } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TransportMode = 'walk' | 'car' | 'cab' | 'bus' | 'train';

export interface TransportModeInfo {
  id: TransportMode;
  label: string;
  icon: LucideIcon;
  osrmProfile: 'foot' | 'car';
  /** Multiply driving/walking duration from OSRM */
  durationFactor: number;
  /** Fallback avg speed km/h when OSRM unavailable */
  fallbackSpeedKmh: number;
  description: string;
  safetyNote: string;
}

export const TRANSPORT_MODES: TransportModeInfo[] = [
  {
    id: 'car',
    label: 'Car',
    icon: Car,
    osrmProfile: 'car',
    durationFactor: 1.08,
    fallbackSpeedKmh: 52,
    description: 'Private car via NH highways',
    safetyNote: 'Lock doors · Share live location',
  },
  {
    id: 'cab',
    label: 'Cab',
    icon: CarFront,
    osrmProfile: 'car',
    durationFactor: 1.18,
    fallbackSpeedKmh: 48,
    description: 'Ola / Uber / local taxi',
    safetyNote: 'Share trip · Verify plate & driver',
  },
  {
    id: 'bus',
    label: 'Bus',
    icon: Bus,
    osrmProfile: 'car',
    durationFactor: 1.42,
    fallbackSpeedKmh: 42,
    description: 'KSRTC / private bus (road route)',
    safetyNote: 'Prefer front seats · Day travel safer',
  },
  {
    id: 'train',
    label: 'Train',
    icon: Train,
    osrmProfile: 'car',
    durationFactor: 0.95,
    fallbackSpeedKmh: 58,
    description: 'Rail estimate (may differ from road path)',
    safetyNote: 'Book confirmed berth · Stay in lit coaches',
  },
  {
    id: 'walk',
    label: 'Walk',
    icon: Footprints,
    osrmProfile: 'foot',
    durationFactor: 1,
    fallbackSpeedKmh: 5,
    description: 'Walking only — best for short trips',
    safetyNote: 'Stay on lit footpaths',
  },
];

export function getModeInfo(mode: TransportMode): TransportModeInfo {
  return TRANSPORT_MODES.find((m) => m.id === mode) ?? TRANSPORT_MODES[0];
}

/** Human-readable duration */
export function formatDuration(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} hr`;
  return `${h} hr ${rem} min`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
