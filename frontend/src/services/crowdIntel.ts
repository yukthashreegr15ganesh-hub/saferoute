import type { LatLng } from './routing';

export type ZoneLevel = 'safe' | 'moderate' | 'danger';

export interface CrowdZone {
  id: string;
  center: LatLng;
  radiusM: number;
  level: ZoneLevel;
  density: number;
}

export interface CrowdTag {
  id: string;
  text: string;
  emoji: string;
  lat: number;
  lng: number;
}

const TAGS = [
  { emoji: '🏃', text: 'People dispersing fast — possible incident' },
  { emoji: '🎉', text: 'Event crowd detected — 2,000+ people' },
  { emoji: '🚶', text: 'Normal pedestrian flow' },
  { emoji: '⚠️', text: 'Unusual gathering detected' },
];

export function generateCrowdZones(center: LatLng): CrowdZone[] {
  const offsets = [
    { dlat: 0.008, dlng: 0.006, level: 'safe' as const, r: 400 },
    { dlat: -0.006, dlng: 0.01, level: 'moderate' as const, r: 350 },
    { dlat: 0.004, dlng: -0.009, level: 'danger' as const, r: 280 },
    { dlat: -0.01, dlng: -0.005, level: 'safe' as const, r: 320 },
    { dlat: 0.012, dlng: 0.002, level: 'moderate' as const, r: 300 },
  ];
  return offsets.map((o, i) => ({
    id: `zone-${i}`,
    center: { lat: center.lat + o.dlat, lng: center.lng + o.dlng },
    radiusM: o.r,
    level: o.level,
    density: o.level === 'danger' ? 0.9 : o.level === 'moderate' ? 0.55 : 0.2,
  }));
}

export function randomCrowdTags(center: LatLng, count = 2): CrowdTag[] {
  return Array.from({ length: count }, (_, i) => {
    const t = TAGS[Math.floor(Math.random() * TAGS.length)];
    return {
      id: `tag-${Date.now()}-${i}`,
      ...t,
      lat: center.lat + (Math.random() - 0.5) * 0.015,
      lng: center.lng + (Math.random() - 0.5) * 0.015,
    };
  });
}

export function mockSafetyScore(center: LatLng): number {
  const n = Math.sin(center.lat * 100) * Math.cos(center.lng * 100);
  return Math.round(55 + n * 35);
}

export const ZONE_COLORS: Record<ZoneLevel, string> = {
  safe: '#2ED573',
  moderate: '#FFA502',
  danger: '#FF4757',
};
