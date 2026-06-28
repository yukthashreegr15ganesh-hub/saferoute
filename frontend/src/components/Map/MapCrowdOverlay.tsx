import { useEffect, useState } from 'react';
import { Circle, Polyline } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { LatLng } from '../../services/routing';
import {
  generateCrowdZones,
  randomCrowdTags,
  ZONE_COLORS,
  type CrowdTag,
  type CrowdZone,
} from '../../services/crowdIntel';

import { sendPushNotification } from '../../services/notifications';

export function AmbientEchoOverlay({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) {
      sendPushNotification('Danger Zone Alert', 'You have entered a Low Light Zone. Be alert.');
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 100%)',
            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
          }}
        >
          <div className="absolute top-24 left-1/2 -translate-x-1/2 glass-panel border border-danger/40 px-4 py-2 rounded-xl flex items-center gap-2 bg-black/60 shadow-danger">
            <AlertTriangle className="text-danger shrink-0" size={16} />
            <span className="text-xs font-bold text-danger">Ambient Echo: Low Light Zone Detected</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface Props {
  location: LatLng | null;
  showZones: boolean;
  showThreat: boolean;
  onScanComplete?: () => void;
}

export function MapCrowdLayers({ location, showZones, showThreat }: Props) {
  const [zones, setZones] = useState<CrowdZone[]>([]);

  useEffect(() => {
    if (location && (showZones || showThreat)) {
      setZones(generateCrowdZones(location));
    } else {
      setZones([]);
    }
  }, [location, showZones, showThreat]);

  if (!location) return null;

  return (
    <>
      {showZones &&
        zones.map((z) => (
          <Circle
            key={z.id}
            center={[z.center.lat, z.center.lng]}
            radius={z.radiusM}
            pathOptions={{
              color: ZONE_COLORS[z.level],
              fillColor: ZONE_COLORS[z.level],
              fillOpacity: 0.15 + z.density * 0.1,
              weight: 2,
              className: 'crowd-zone-pulse animate-pulse',
            }}
          />
        ))}
      {showThreat &&
        zones
          .filter((z) => z.level === 'danger')
          .map((z) => (
            <Circle
              key={`threat-${z.id}`}
              center={[z.center.lat, z.center.lng]}
              radius={z.radiusM * 0.7}
              pathOptions={{
                color: '#FF4757',
                fillColor: '#FF4757',
                fillOpacity: 0.25,
                weight: 3,
                dashArray: '8 8',
              }}
            />
          ))}
    </>
  );
}

export function PreScanRadar({ location, active }: { location: LatLng | null; active: boolean }) {
  if (!location || !active) return null;
  return (
    <>
      {[120, 240, 400].map((r, i) => (
        <Circle
          key={r}
          center={[location.lat, location.lng]}
          radius={r}
          pathOptions={{
            color: '#00FFB2',
            fillColor: '#00FFB2',
            fillOpacity: 0.03 - i * 0.008,
            weight: 1,
            opacity: 0.6 - i * 0.15,
          }}
        />
      ))}
    </>
  );
}

export function CrowdFlowArrows({ location, visible }: { location: LatLng | null; visible: boolean }) {
  if (!location || !visible) return null;
  const lines: [number, number][][] = [
    [
      [location.lat, location.lng],
      [location.lat + 0.004, location.lng + 0.003],
    ],
    [
      [location.lat - 0.002, location.lng],
      [location.lat + 0.002, location.lng + 0.006],
    ],
  ];
  return (
    <>
      {lines.map((pts, i) => (
        <Polyline
          key={i}
          positions={pts}
          pathOptions={{ color: '#00FFB2', weight: 3, opacity: 0.5, dashArray: '4 12' }}
        />
      ))}
    </>
  );
}

export function useCrowdPreScan(location: LatLng | null) {
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [tags, setTags] = useState<CrowdTag[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!location || scanDone) return;
    setScanning(true);
    const t = setTimeout(() => {
      setScanning(false);
      setScanDone(true);
      setTags(randomCrowdTags(location, 2));
      setShowToast(true);
      const hide = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(hide);
    }, 2000);
    return () => clearTimeout(t);
  }, [location, scanDone]);

  useEffect(() => {
    if (tags.length === 0) return;
    const t = setTimeout(() => setTags([]), 5000);
    return () => clearTimeout(t);
  }, [tags.length]);

  return { scanning, scanDone, tags, showToast, setShowToast };
}

export function CrowdToast({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-6 right-6 z-[1100] glass-panel border border-warning/40 px-4 py-3 rounded-xl flex items-center gap-3 shadow-glow w-max"
        >
          <AlertTriangle className="text-warning shrink-0" size={20} />
          <span className="text-sm font-bold tracking-wide">Pre-Journey Signal Detected</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CrowdTagLabels({ tags }: { tags: CrowdTag[] }) {
  return (
    <div className="absolute bottom-36 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.div
            key={tag.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="glass-panel px-3 py-2 rounded-xl text-xs border border-primary/20 self-start"
          >
            {tag.emoji} {tag.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
