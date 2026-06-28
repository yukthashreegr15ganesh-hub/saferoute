import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2, Target, Shield, Users, Footprints, MapPin, AlertTriangle, Camera, Route } from 'lucide-react';
import {
  MapCrowdLayers,
  PreScanRadar,
  CrowdFlowArrows,
  useCrowdPreScan,
  CrowdToast,
  CrowdTagLabels,
  AmbientEchoOverlay,
} from './MapCrowdOverlay';
import { useLocation } from '../../hooks/useLocation';
import { planTrip, type RouteData, type SafeSpot, type LatLng, type TripPlan } from '../../services/routing';
import { type TransportMode, getModeInfo } from '../../services/transportModes';
import TransportModePicker from './TransportModePicker';
import { isNightMode } from '../../services/location';
import RouteOptions from './RouteOptions';
import SafeSpotMarker from './SafeSpotMarker';
import VoiceNav from '../Navigation/VoiceNav';
import { useVoiceNav } from '../../hooks/useVoiceNav';
import { useSafeRouteStore } from '../../store/safeRouteStore';
import AudioDecoy from './AudioDecoy';
import DroneGuardian from './DroneGuardian';

/** Leaflet needs explicit height — fixes the thin horizontal map strip */
function MapResize({ trigger }: { trigger: number }) {
  const map = useMap();
  useEffect(() => {
    const run = () => map.invalidateSize({ animate: true });
    const t1 = setTimeout(run, 50);
    const t2 = setTimeout(run, 300);
    window.addEventListener('resize', run);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', run);
    };
  }, [map, trigger]);
  return null;
}

function MapFitBounds({
  bounds,
  enabled,
}: {
  bounds: L.LatLngBoundsExpression | null;
  enabled: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !bounds) return;
    const t = setTimeout(() => {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [bounds, enabled, map]);
  return null;
}

function MapFlyToMe({ center, go }: { center: LatLng | null; go: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (go && center) map.flyTo([center.lat, center.lng], 16, { duration: 0.8 });
  }, [go, center, map]);
  return null;
}

function boundsFromRoutes(routes: RouteData[], location: LatLng | null): L.LatLngBounds | null {
  const pts: [number, number][] = [];
  routes.forEach((r) => r.points.forEach((p) => pts.push(p)));
  if (location) pts.push([location.lat, location.lng]);
  if (pts.length < 2) return null;
  return L.latLngBounds(pts);
}

const destIcon = new L.DivIcon({
  className: 'dest-marker',
  html: '<div style="width:14px;height:14px;background:#ffa502;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px #ffa502"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function MapView() {
  const { location, error: locationError, isLoading: locationLoading, usingFallback, retry: retryLocation } = useLocation();
  const { addRouteLog, mapLayers, toggleMapLayer } = useSafeRouteStore();

  const [origin, setOrigin] = useState('Bengaluru');
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<LatLng | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [isNavigating, setIsNavigating] = useState(false);
  const [timeMode, setTimeMode] = useState('Now');
  const [safeSpots, setSafeSpots] = useState<SafeSpot[]>([]);
  const [flyToMe, setFlyToMe] = useState(false);
  const [showMobileRoutes, setShowMobileRoutes] = useState(true);
  const nightMode = isNightMode() || timeMode === '8 PM' || timeMode === '11 PM';
  const { scanning, tags, showToast } = useCrowdPreScan(location);

  const { currentInstruction, nextInstruction, repeatInstruction, stopNavigation } = useVoiceNav(
    activeRoute?.instructions || [],
    isNavigating,
    activeRoute?.points ?? [],
    location
  );

  const routeBounds = useMemo(
    () => boundsFromRoutes(routes, location),
    [routes, location]
  );

  const layoutKey = routes.length > 0 ? 1 : 0;

  const runTripPlan = async (mode: TransportMode = transportMode) => {
    if (!destination.trim()) return;
    const from = useMyLocation && location ? location : origin.trim();
    if (!from) {
      alert('Set a starting city or enable "Use my GPS".');
      return;
    }
    setIsSearching(true);
    try {
      const plan = await planTrip(from, destination.trim(), mode, timeMode);
      setTripPlan(plan);
      setRoutes(plan.routes);
      setSafeSpots(plan.safeSpots);
      setShowMobileRoutes(true);
      if (plan.routes.length > 0) {
        setActiveRoute(plan.routes[0]);
        setDestCoords(plan.to);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not plan trip.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void runTripPlan();
  };

  const handleModeChange = (mode: TransportMode) => {
    setTransportMode(mode);
    if (destination.trim() && (useMyLocation ? location : origin.trim())) {
      void runTripPlan(mode);
    }
  };

  const clearRoutes = () => {
    setRoutes([]);
    setTripPlan(null);
    setActiveRoute(null);
    setDestCoords(null);
    setSafeSpots([]);
  };

  const handleStartNav = () => {
    if (!activeRoute) return;
    setIsNavigating(true);
    setShowMobileRoutes(false);
    addRouteLog({
      start: tripPlan?.fromLabel ?? origin,
      destination: tripPlan?.toLabel ?? destination,
      score: activeRoute.score,
    });
  };

  const handleStopNav = () => {
    setIsNavigating(false);
    clearRoutes();
    setDestination('');
    stopNavigation();
  };

  const centerOnMe = () => {
    setFlyToMe(true);
    setTimeout(() => setFlyToMe(false), 500);
  };

  const userIcon = useCallback(
    () =>
      new L.DivIcon({
        className: 'user-marker-sonar-wrap',
        html: `<div class="user-marker-sonar"><span class="ring"></span><span class="ring"></span><span class="ring"></span><span class="core"></span></div>`,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      }),
    []
  );

  const layerPills = [
    { key: 'crowdIntel' as const, label: 'Crowd Intel', icon: Users },
    { key: 'threatZones' as const, label: 'Threat Zones', icon: AlertTriangle },
    { key: 'sentinelSpots' as const, label: 'Sentinel Spots', icon: Shield },
    { key: 'ghostWalk' as const, label: 'Ghost Walk', icon: Footprints },
    { key: 'cctvGrid' as const, label: 'CCTV Grid', icon: Camera },
    { key: 'escapeRoutes' as const, label: 'Escape Routes', icon: Route },
  ];

  const showRoutePanel = !isNavigating && routes.length > 0;
  const tripLabel = tripPlan
    ? `${tripPlan.fromLabel} → ${tripPlan.toLabel} · ${tripPlan.corridorKm.toFixed(0)} km corridor`
    : undefined;

  return (
    <div className={`map-page h-full w-full min-h-0 flex ${nightMode ? 'night-ops' : ''}`}>
      <CrowdToast show={showToast} />
      <AmbientEchoOverlay active={timeMode === '11 PM'} />
      {!isNavigating && <CrowdTagLabels tags={tags} />}
      {!isNavigating && <AudioDecoy />}
      {!isNavigating && <DroneGuardian />}
      {/* Desktop sidebar — in layout flow, does not cover map */}
      {showRoutePanel && (
        <aside className="hidden md:flex md:w-[320px] md:shrink-0 md:h-full md:flex-col md:border-r md:border-white/10 md:bg-card/95 md:z-20 md:overflow-hidden">
          <RouteOptions
            routes={routes}
            activeRoute={activeRoute}
            onSelect={setActiveRoute}
            onStartNav={handleStartNav}
            variant="sidebar"
            tripLabel={tripLabel}
          />
        </aside>
      )}

      {/* Map column — always fills remaining space */}
      <div className="relative flex-1 min-w-0 min-h-0 h-full flex flex-col">
        {isNavigating && activeRoute && (
          <VoiceNav
            instruction={currentInstruction}
            totalDistance={activeRoute.distance}
            totalEta={activeRoute.eta}
            onNext={nextInstruction}
            onRepeat={repeatInstruction}
            onStop={handleStopNav}
          />
        )}

        {/* Search & controls — compact top bar */}
        {!isNavigating && (
          <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none max-w-2xl md:max-w-3xl">
            <div className="glass-panel rounded-2xl p-3 shadow-xl pointer-events-auto space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={useMyLocation ? 'My GPS location' : origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  disabled={useMyLocation}
                  placeholder="From (e.g. Bengaluru)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm min-h-[44px] disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setUseMyLocation((v) => !v)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 ${useMyLocation ? 'bg-primary text-background' : 'bg-white/10'}`}
                >
                  GPS
                </button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="To (e.g. Shivamogga, Karnataka)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={!destination.trim() || isSearching || (useMyLocation && !location)}
                  className="px-5 rounded-xl bg-primary text-background font-bold text-sm disabled:opacity-40 flex items-center gap-1"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  Go
                </button>
              </form>
            </div>

            <TransportModePicker value={transportMode} onChange={handleModeChange} />

            {tripPlan && activeRoute && (
              <div className="glass-panel rounded-xl px-4 py-3 pointer-events-auto border border-primary/30">
                <div className="text-sm font-bold text-primary">
                  {tripPlan.fromLabel} → {tripPlan.toLabel}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {activeRoute.eta}
                  <span className="text-base text-textMuted font-normal ml-2">by {getModeInfo(transportMode).label}</span>
                </div>
                <div className="text-sm text-textMuted mt-1">
                  {activeRoute.distance} · Safety {activeRoute.score}/100 · {safeSpots.length} safe spots on map
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pointer-events-auto">
              <span className="glass-panel px-3 py-1.5 rounded-full text-xs text-primary flex items-center gap-1">
                <MapPin size={12} />
                {useMyLocation ? (location ? 'GPS on' : 'GPS…') : origin || 'Set origin'}
              </span>
              {['Now', '8 PM', '11 PM'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setTimeMode(time)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    timeMode === time ? 'bg-primary text-background' : 'glass-panel'
                  }`}
                >
                  {time}
                </button>
              ))}
              {layerPills.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleMapLayer(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    mapLayers[key] ? 'bg-primary/30 text-primary border border-primary/50' : 'glass-panel'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {(locationError || usingFallback) && !isNavigating && (
          <div className="absolute top-28 left-3 right-3 z-[1000] glass-panel px-3 py-2 rounded-xl text-xs text-warning flex justify-between gap-2 max-w-lg">
            <span>{locationError}</span>
            <button type="button" onClick={retryLocation} className="text-primary font-bold shrink-0">
              Retry GPS
            </button>
          </div>
        )}

        {!isNavigating && (
          <button
            type="button"
            onClick={centerOnMe}
            className="absolute bottom-28 md:bottom-6 right-4 z-[1000] w-12 h-12 glass-panel rounded-full flex items-center justify-center shadow-lg"
            aria-label="Center on me"
          >
            <Target size={22} className="text-primary" />
          </button>
        )}

        {/* Full-height map */}
        <div className="map-root absolute inset-0 z-0">
          {locationLoading && !location && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#050A0F]">
              <Loader2 size={40} className="text-primary animate-spin" />
              <p className="text-textMuted text-sm">Getting your location…</p>
            </div>
          )}
          {location && (
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={14}
              className="map-container"
              style={{ height: '100%', width: '100%' }}
              zoomControl
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapResize trigger={layoutKey} />
              <MapFitBounds bounds={routeBounds} enabled={!isNavigating && routes.length > 0} />
              <MapFlyToMe center={location} go={flyToMe} />

              <PreScanRadar location={location} active={scanning} />
              <MapCrowdLayers
                location={location}
                showZones={mapLayers.crowdIntel}
                showThreat={mapLayers.threatZones}
              />
              <CrowdFlowArrows location={location} visible={mapLayers.crowdIntel && routes.length > 0} />

              <Marker position={[location.lat, location.lng]} icon={userIcon()} />
              {destCoords && <Marker position={[destCoords.lat, destCoords.lng]} icon={destIcon} />}

              {(mapLayers.sentinelSpots || routes.length > 0) &&
                safeSpots.map((s) => <SafeSpotMarker key={s.id} spot={s} />)}

              {mapLayers.cctvGrid &&
                [0.003, -0.004].map((o, i) => (
                  <Circle
                    key={`cctv-${i}`}
                    center={[location.lat + o, location.lng - o * 0.8]}
                    radius={80}
                    pathOptions={{ color: '#00FFB2', fillOpacity: 0.05, dashArray: '4 6', weight: 1 }}
                  />
                ))}

              {mapLayers.escapeRoutes && routes[0] && (
                <Polyline
                  positions={routes[0].points}
                  pathOptions={{ color: '#00FFB2', weight: 4, opacity: 0.4, dashArray: '12 8' }}
                />
              )}

              {mapLayers.ghostWalk && routes.length > 1 && (
                <Polyline
                  positions={routes[routes.length - 1].points}
                  pathOptions={{ color: '#7A8FA6', weight: 3, opacity: 0.35, dashArray: '2 10' }}
                />
              )}

              {isNavigating && activeRoute ? (
                <Polyline
                  positions={activeRoute.points}
                  pathOptions={{ color: '#2ed573', weight: 8, opacity: 0.95 }}
                />
              ) : (
                routes.map((route) => {
                  const selected = activeRoute?.id === route.id;
                  const color =
                    route.label === 'SAFE' ? '#2ed573' : route.label === 'MODERATE' ? '#ffa502' : '#ff4757';
                  return (
                    <Polyline
                      key={route.id}
                      positions={route.points}
                      pathOptions={{
                        color,
                        weight: selected ? 7 : 5,
                        opacity: selected ? 1 : 0.55,
                        dashArray: selected ? undefined : '10, 14',
                      }}
                      eventHandlers={{ click: () => setActiveRoute(route) }}
                    />
                  );
                })
              )}
            </MapContainer>
          )}
        </div>

        {/* Mobile route sheet */}
        {showRoutePanel && (
          <div
            className={`md:hidden fixed bottom-0 left-0 right-0 z-[900] transition-transform duration-300 ${
              showMobileRoutes ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
            }`}
          >
            <button
              type="button"
              onClick={() => setShowMobileRoutes((v) => !v)}
              className="w-full glass-panel border-t border-white/10 py-3 text-sm font-bold text-primary rounded-t-2xl"
            >
              {showMobileRoutes ? '▼ Hide routes' : '▲ Show routes'} ({routes.length})
            </button>
            <div className="max-h-[45vh] overflow-y-auto glass-panel border-t border-white/10 px-4 pb-6">
              <RouteOptions
                routes={routes}
                activeRoute={activeRoute}
                onSelect={setActiveRoute}
                onStartNav={handleStartNav}
                variant="sheet"
                tripLabel={tripLabel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
