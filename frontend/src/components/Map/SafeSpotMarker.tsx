import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { SafeSpot } from '../../services/routing';

const shieldIcon = new L.DivIcon({
  className: 'safe-spot-marker',
  html: `<div style="width:28px;height:28px;background:#00d4aa;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 0 10px rgba(0,212,170,0.6)">🛡️</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function SafeSpotMarker({ spot }: { spot: SafeSpot }) {
  return (
    <Marker position={[spot.lat, spot.lng]} icon={shieldIcon}>
      <Popup>
        <strong>{spot.name}</strong>
        <br />
        {spot.type} · {spot.distance}
        <br />
        {spot.isOpen ? 'Open now' : 'May be closed'}
        {spot.walkTime ? ` · ${spot.walkTime}` : ''}
      </Popup>
    </Marker>
  );
}
