import type { LatLng } from './routing';

export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

export function buildSosMessage(name: string, lat: number, lng: number): string {
  const link = googleMapsLink(lat, lng);
  return `🚨 ${name} needs help! Live location: ${link} — SafeRoute Alert`;
}

export function buildLowBatteryMessage(name: string, lat: number, lng: number): string {
  const link = googleMapsLink(lat, lng);
  return `⚠️ ${name}'s phone battery is low. Last known location: ${link}`;
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function isNightMode(hour = new Date().getHours()): boolean {
  return hour >= 20 || hour < 6;
}
