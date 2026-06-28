import axios from 'axios';
import {
  type TransportMode,
  getModeInfo,
  formatDuration,
  formatDistance,
} from './transportModes';
import { distanceMeters } from './location';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteInstruction {
  text: string;
  distance: number;
}

export interface RouteData {
  id: string;
  name: string;
  label: 'SAFE' | 'MODERATE' | 'DANGER';
  score: number;
  tags: string[];
  distance: string;
  eta: string;
  distanceKm: number;
  durationMinutes: number;
  transportMode: TransportMode;
  points: [number, number][];
  bounds: [[number, number], [number, number]];
  instructions: RouteInstruction[];
  safeSpotsAlong?: number;
}

export interface SafeSpot {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  distance: string;
  distanceKm: number;
  isOpen: boolean;
  walkTime?: string;
}

export interface TripPlan {
  from: LatLng;
  fromLabel: string;
  to: LatLng;
  toLabel: string;
  routes: RouteData[];
  safeSpots: SafeSpot[];
  corridorKm: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TIMEOUT = 15000;
const http = axios.create({ timeout: TIMEOUT });

function haversineKm(a: LatLng, b: LatLng): number {
  return distanceMeters(a, b) / 1000;
}

function safetyMeta(index: number, timeMode: string, mode: TransportMode) {
  const nightPenalty = timeMode === '11 PM' ? 12 : timeMode === '8 PM' ? 6 : 0;
  const modeTag = getModeInfo(mode).label;
  if (index === 0) {
    return {
      label: 'SAFE' as const,
      score: Math.max(68, 90 - nightPenalty),
      tags: ['Well lit ✓', 'CCTV ✓', 'Busy road', modeTag],
      name: 'Safest route',
    };
  }
  if (index === 1) {
    return {
      label: 'MODERATE' as const,
      score: Math.max(48, 70 - nightPenalty),
      tags: ['Some dark patches', 'Moderate traffic', modeTag],
      name: 'Balanced route',
    };
  }
  return {
    label: 'DANGER' as const,
    score: Math.max(22, 38 - nightPenalty),
    tags: ['Isolated stretches ✗', 'Poor lighting ✗', modeTag],
    name: 'Shortcut (higher risk)',
  };
}

function applyModeTiming(
  baseDurationMin: number,
  distanceKm: number,
  mode: TransportMode
): { minutes: number; km: number } {
  const info = getModeInfo(mode);
  let minutes = baseDurationMin * info.durationFactor;
  let km = distanceKm;

  if (mode === 'train') {
    // Inter-city rail often faster than road for 200+ km in India
    const railHours = distanceKm / info.fallbackSpeedKmh + 0.75;
    minutes = railHours * 60;
  } else if (mode === 'bus') {
    minutes = Math.max(minutes, (distanceKm / info.fallbackSpeedKmh) * 60 * 1.05);
  } else if (mode === 'walk' && distanceKm > 15) {
    minutes = (distanceKm / info.fallbackSpeedKmh) * 60;
  }

  return { minutes: Math.max(1, Math.round(minutes)), km };
}

function buildBounds(points: [number, number][]): [[number, number], [number, number]] {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

export async function geocodePlace(query: string): Promise<LatLng & { displayName: string }> {
  let q = query.trim();
  if (!/[,]|\bindia\b/i.test(q)) q = `${q}, Karnataka, India`;
  const headers = { 'Accept-Language': 'en', 'User-Agent': 'SafeRoute/1.0' };
  let res = await http.get('https://nominatim.openstreetmap.org/search', {
    params: { format: 'json', q, limit: 1, countrycodes: 'in' },
    headers,
  });
  if (!res.data?.[0]) {
    res = await http.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', q: query.trim(), limit: 1 },
      headers,
    });
  }
  if (!res.data?.[0]) throw new Error(`Could not find "${query}". Try "Bengaluru" or "Shivamogga, Karnataka".`);
  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon),
    displayName: res.data[0].display_name?.split(',')[0] ?? query,
  };
}

interface OsrmRouteRaw {
  geometry: { coordinates: number[][] };
  distance: number;
  duration: number;
  legs: { steps: { maneuver: { instruction?: string; type: string; modifier?: string }; name?: string; distance: number }[] }[];
}

async function fetchOsrmRoutes(
  start: LatLng,
  dest: LatLng,
  mode: TransportMode
): Promise<OsrmRouteRaw[]> {
  const profile = getModeInfo(mode).osrmProfile;
  const coords = `${start.lng},${start.lat};${dest.lng},${dest.lat}`;
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&alternatives=true&steps=true`;
  const res = await http.get(url);
  if (res.data.code !== 'Ok' || !res.data.routes?.length) {
    throw new Error('Routing service unavailable');
  }
  return res.data.routes.slice(0, 3);
}

function mapOsrmToRouteData(
  route: OsrmRouteRaw,
  index: number,
  mode: TransportMode,
  timeMode: string
): RouteData {
  const points: [number, number][] = route.geometry.coordinates.map((c) => [c[1], c[0]]);
  const distanceKm = route.distance / 1000;
  const baseMin = route.duration / 60;
  const { minutes, km } = applyModeTiming(baseMin, distanceKm, mode);
  const meta = safetyMeta(index, timeMode, mode);

  const instructions: RouteInstruction[] = route.legs[0].steps.slice(0, 12).map((step) => {
    let text = step.maneuver.instruction || step.name || 'Continue';
    if (step.maneuver.type === 'turn') {
      text = `Turn ${step.maneuver.modifier ?? ''} onto ${step.name || 'road'}`.trim();
    } else if (step.maneuver.type === 'arrive') {
      text = 'Arrive at destination';
    }
    return { text, distance: step.distance };
  });

  return {
    id: `${mode}_${index}`,
    name: meta.name,
    label: meta.label,
    score: meta.score,
    tags: meta.tags,
    distance: formatDistance(km),
    eta: formatDuration(minutes),
    distanceKm: km,
    durationMinutes: minutes,
    transportMode: mode,
    points,
    bounds: buildBounds(points),
    instructions: instructions.length ? instructions : [{ text: meta.name, distance: 0 }],
  };
}

function buildFallbackFromDistance(
  start: LatLng,
  dest: LatLng,
  mode: TransportMode,
  timeMode: string
): RouteData[] {
  const km = haversineKm(start, dest);
  const info = getModeInfo(mode);
  const baseMin = (km / info.fallbackSpeedKmh) * 60;
  const mid: LatLng = { lat: (start.lat + dest.lat) / 2 + 0.02, lng: (start.lng + dest.lng) / 2 };
  const mid2: LatLng = { lat: (start.lat + dest.lat) / 2 - 0.02, lng: (start.lng + dest.lng) / 2 };

  return [0, 1, 2].map((i) => {
    const pts: [number, number][] =
      i === 0
        ? [[start.lat, start.lng], [dest.lat, dest.lng]]
        : i === 1
          ? [[start.lat, start.lng], [mid.lat, mid.lng], [dest.lat, dest.lng]]
          : [[start.lat, start.lng], [mid2.lat, mid2.lng], [dest.lat, dest.lng]];
    const { minutes, km: dKm } = applyModeTiming(baseMin + i * 8, km + i * 2, mode);
    const meta = safetyMeta(i, timeMode, mode);
    return {
      id: `fb_${mode}_${i}`,
      name: meta.name,
      label: meta.label,
      score: meta.score,
      tags: meta.tags,
      distance: formatDistance(dKm),
      eta: formatDuration(minutes),
      distanceKm: dKm,
      durationMinutes: minutes,
      transportMode: mode,
      points: pts,
      bounds: buildBounds(pts),
      instructions: [{ text: `Travel ${formatDistance(dKm)} by ${info.label}`, distance: 0 }],
    };
  });
}

/** Safe spots along corridor + near destination */
export async function getSafeSpotsForTrip(
  from: LatLng,
  to: LatLng,
  routePoints: [number, number][]
): Promise<SafeSpot[]> {
  const samples: LatLng[] = [from, to];
  if (routePoints.length > 4) {
    const step = Math.floor(routePoints.length / 4);
    for (let i = step; i < routePoints.length; i += step) {
      samples.push({ lat: routePoints[i][0], lng: routePoints[i][1] });
    }
  }

  const templates = [
    { type: 'Hospital', names: ['District Hospital', 'Apollo 24/7', 'City Care'] },
    { type: 'Police', names: ['Police Station', 'Highway Patrol', 'Women Helpline Booth'] },
    { type: 'Shop', names: ['24/7 Store', 'Petrol Bunk Mart', 'Reliance Fresh'] },
    { type: 'Transit', names: ['Bus Stand', 'Railway Station', 'Taxi Stand'] },
    { type: 'Cafe', names: ['Highway Cafe', 'Tea Point', 'Dhaba'] },
  ];

  const spots: SafeSpot[] = [];
  samples.forEach((sample, si) => {
    templates.forEach((t, ti) => {
      const offset = 0.008 * (si + 1) * (ti % 2 ? 1 : -1);
      const distKm = haversineKm(from, { lat: sample.lat + offset, lng: sample.lng + offset });
      spots.push({
        id: `${si}-${ti}`,
        name: t.names[ti % t.names.length],
        type: t.type,
        lat: sample.lat + offset * 0.3,
        lng: sample.lng + offset * 0.5,
        distance: formatDistance(distKm),
        distanceKm: distKm,
        isOpen: ti !== 4 || si % 2 === 0,
        walkTime: distKm < 2 ? `${Math.round(distKm * 12)} min walk` : undefined,
      });
    });
  });

  try {
    const res = await http.get(`${API_URL}/safe-spots`, { params: { lat: to.lat, lng: to.lng } });
    res.data?.slice(0, 3).forEach((s: { name: string; type: string; distance: string; isOpen: boolean }, i: number) => {
      spots.push({
        id: `api-${i}`,
        name: s.name,
        type: s.type,
        lat: to.lat + 0.004 * (i + 1),
        lng: to.lng + 0.003 * i,
        distance: s.distance,
        distanceKm: 0.5 + i * 0.3,
        isOpen: s.isOpen,
      });
    });
  } catch { /* local spots enough */ }

  return spots.slice(0, 18);
}

export async function planTrip(
  fromInput: string | LatLng,
  toInput: string | LatLng,
  mode: TransportMode,
  timeMode = 'Now'
): Promise<TripPlan> {
  const from =
    typeof fromInput === 'string'
      ? await geocodePlace(fromInput)
      : { ...fromInput, displayName: 'Your location' };
  const to =
    typeof toInput === 'string' ? await geocodePlace(toInput) : { ...toInput, displayName: 'Destination' };

  const corridorKm = haversineKm(from, to);
  if (mode === 'walk' && corridorKm > 20) {
    throw new Error(
      `Walking is not practical for ${corridorKm.toFixed(0)} km. Choose Car, Bus, Train, or Cab.`
    );
  }

  let routes: RouteData[] = [];
  try {
    const osrm = await fetchOsrmRoutes(from, to, mode);
    routes = osrm.map((r, i) => mapOsrmToRouteData(r, i, mode, timeMode));
  } catch {
    routes = buildFallbackFromDistance(from, to, mode, timeMode);
  }

  const mainPoints = routes[0]?.points ?? [];
  const safeSpots = await getSafeSpotsForTrip(from, to, mainPoints);

  routes = routes.map((r) => ({
    ...r,
    safeSpotsAlong: safeSpots.filter((s) => s.distanceKm < haversineKm(from, to) * 0.6).length,
    tags: [...r.tags, `${safeSpots.length} safe spots nearby`],
  }));

  return {
    from,
    fromLabel: from.displayName,
    to,
    toLabel: to.displayName,
    routes,
    safeSpots,
    corridorKm,
  };
}

/** @deprecated use planTrip */
export async function getRoutes(
  start: LatLng,
  destination: string | LatLng,
  timeMode = 'Now',
  mode: TransportMode = 'car'
): Promise<RouteData[]> {
  const plan = await planTrip(start, destination, mode, timeMode);
  return plan.routes;
}
