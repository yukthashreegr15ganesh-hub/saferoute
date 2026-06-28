import React, { useState, useEffect, useContext, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Building2, Users, Eye, Loader2, Navigation, XCircle } from 'lucide-react';
import axios from 'axios';
import { AppContext } from '../App';
import RouteOptions from './RouteOptions';
import SafeSpotFinder from './SafeSpotFinder';
import CrowdPulse from './CrowdPulse';
import ReportPin from './ReportPin';
import ShadowWalkMode from './ShadowWalkMode';

function MapController({ center, bounds, navigateMode }) {
  const map = useMap();
  useEffect(() => {
    if (navigateMode && bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true, duration: 1.5 });
    } else if (center && !navigateMode) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
  }, [center, bounds, navigateMode, map]);
  return null;
}

export default function MapView() {
  const { userLocation, activeRoute, setActiveRoute, shadowWalkStatus } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [destination, setDestination] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [timeMode, setTimeMode] = useState('Now');
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  const [safeSpotOpen, setSafeSpotOpen] = useState(false);
  const [crowdPulseOpen, setCrowdPulseOpen] = useState(false);
  const [reportPinOpen, setReportPinOpen] = useState(false);
  const [shadowWalkOpen, setShadowWalkOpen] = useState(false);
  const [reportCoords, setReportCoords] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const [isNavigating, setIsNavigating] = useState(false);

  const placeholders = ["MG Road, Bengaluru...", "Eiffel Tower, Paris...", "Times Square, NY..."];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userLocation && !isNavigating) {
      axios.get(`http://localhost:8000/incidents/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}`)
        .then(res => setIncidents(res.data))
        .catch(console.error);
    }
  }, [userLocation, isNavigating]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search || !userLocation) return;
    setIsSearching(true);
    setShowDropdown(false);
    
    try {
      const res = await axios.post('http://localhost:8000/routes', {
        start: userLocation,
        destination: search
      });
      // Enhance mock tags for RouteOptions matching
      const mapped = res.data.map(r => ({
        ...r,
        tags: r.label === 'SAFE' ? ['Well Lit ✓', 'CCTV ✓'] : 
              r.label === 'MODERATE' ? ['Moderate crowds', 'Some dark spots'] : 
              ['Isolated ✗', 'Poor Lighting ✗']
      }));
      setRoutes(mapped);
      if (mapped.length > 0) {
        setActiveRoute(mapped[0]);
        // Set center to destination bounding roughly
        setDestination({ lat: mapped[0].bounds[1][0], lng: mapped[0].bounds[1][1] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleTimeSwitch = (time) => {
    setTimeMode(time);
    if (routes.length > 0) {
      setIsRecalculating(true);
      setTimeout(() => setIsRecalculating(false), 800);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setRoutes([]);
    setActiveRoute(null);
    setSearch('');
    setDestination(null);
  };

  const getRouteColor = (label) => {
    if (label === 'SAFE') return '#2ECC71';
    if (label === 'MODERATE') return '#F39C12';
    return '#FF4D6D';
  };

  const createUserMarker = () => new L.DivIcon({
    className: 'user-marker',
    html: `<div style="position:relative;width:24px;height:24px;">
            <div style="position:absolute;width:100%;height:100%;background:var(--primary);border-radius:50%;border:3px solid #fff;box-shadow:0 0 15px rgba(13,115,119,0.8);z-index:2;"></div>
            <div style="position:absolute;top:-50%;left:-50%;right:-50%;bottom:-50%;border:2px solid var(--primary);border-radius:50%;animation:pulseRing 2s infinite;z-index:1;"></div>
           </div>`,
    iconSize: [24, 24], iconAnchor: [12, 12]
  });

  const createIncidentMarker = (color) => new L.DivIcon({
    className: 'incident-marker',
    html: `<div style="position:relative;width:16px;height:16px;">
            <div style="position:absolute;width:100%;height:100%;background:${color};border-radius:50%;border:2px solid #fff;z-index:2;"></div>
            <div style="position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:${color};opacity:0.3;border-radius:50%;animation:pulseRing 2s infinite;z-index:1;"></div>
           </div>`,
    iconSize: [16, 16], iconAnchor: [8, 8]
  });

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .search-container:focus-within { box-shadow: 0 0 0 3px rgba(13, 115, 119, 0.2); border-color: var(--primary) !important; }
        .route-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: drawRoute 2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes drawRoute { to { stroke-dashoffset: 0; } }
        .map-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(13, 115, 119, 0.3); }
        .map-btn.active { background: var(--primary) !important; color: #fff !important; border-color: var(--primary) !important; }
        .time-pill.active { background: var(--primary) !important; color: #fff !important; box-shadow: 0 4px 15px rgba(13, 115, 119, 0.4); }
        .placeholder-anim { animation: fadePlaceholder 3s infinite; }
        @keyframes fadePlaceholder { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* Route Options Sidebar */}
      {!isNavigating && routes.length > 0 && <RouteOptions routes={routes} onSelect={setActiveRoute} onNavigate={startNavigation} />}

      {/* Main Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        
        {/* Navigation Mode Banner */}
        {isNavigating && activeRoute ? (
          <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'auto', animation: 'fadeSlideUp 0.4s ease' }}>
            <div className="glass-card" style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '24px', background: 'var(--primary)', borderColor: 'var(--primary)', boxShadow: '0 10px 30px rgba(13,115,119,0.5)', borderRadius: '30px' }}>
              <Navigation size={28} color="#fff" style={{ animation: 'bounceIn 2s infinite' }} />
              <div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>Navigating to Destination</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{activeRoute.eta} remaining • {activeRoute.label} Route</div>
              </div>
              <button onClick={endNavigation} style={{ background: '#fff', color: 'var(--primary)', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform='scale(1)'}>
                <XCircle size={18} /> End Route
              </button>
            </div>
          </div>
        ) : (
          /* Top Controls Overlay */
          <div style={{ position: 'absolute', top: 24, left: 24, right: 24, zIndex: 1000, display: 'flex', gap: '16px', pointerEvents: 'none' }}>
            
            <div style={{ flex: 1, position: 'relative', pointerEvents: 'auto' }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
                <div className="glass-card search-container" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '12px 20px', transition: 'all 0.2s' }}>
                  <MapPin size={20} color="var(--primary)" style={{ marginRight: '12px' }} />
                  <input type="text" value="Current Location" disabled style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', flex: 1 }} />
                </div>
                <div className="glass-card search-container" style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '12px 20px', transition: 'all 0.2s', position: 'relative' }}>
                  {isSearching ? <Loader2 size={20} color="var(--primary)" className="shield-spinner" style={{ marginRight: '12px', animation: 'spin 1s linear infinite' }} /> : <Search size={20} color="var(--text-muted)" style={{ marginRight: '12px' }} />}
                  <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                    {!search && <div className="placeholder-anim" style={{ position: 'absolute', color: 'var(--text-muted)', pointerEvents: 'none' }}>{placeholders[placeholderIdx]}</div>}
                    <input 
                      type="text" value={search} onChange={e => { setSearch(e.target.value); setShowDropdown(e.target.value.length > 0); }}
                      style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', flex: 1, outline: 'none', position: 'relative', zIndex: 1 }}
                    />
                  </div>
                </div>
                <button type="submit" style={{ display: 'none' }}>Search</button>
              </form>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', pointerEvents: 'auto' }}>
              <button onClick={() => setSafeSpotOpen(!safeSpotOpen)} className={`glass-card map-btn ${safeSpotOpen ? 'active' : ''}`} style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)', color: '#fff', transition: 'all 0.2s' }}>
                <Building2 size={20} color={safeSpotOpen ? '#fff' : "var(--primary)"} /> Safe Spots
              </button>
              <button onClick={() => setCrowdPulseOpen(!crowdPulseOpen)} className={`glass-card map-btn ${crowdPulseOpen ? 'active' : ''}`} style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)', color: '#fff', transition: 'all 0.2s' }}>
                <Users size={20} color={crowdPulseOpen ? '#fff' : "var(--primary)"} /> Crowd
              </button>
              <button onClick={() => setShadowWalkOpen(!shadowWalkOpen)} className={`glass-card map-btn ${shadowWalkStatus.active || shadowWalkOpen ? 'active' : ''}`} style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)', color: '#fff', transition: 'all 0.2s' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Eye size={20} color={shadowWalkStatus.active || shadowWalkOpen ? '#fff' : "var(--primary)"} />
                  {shadowWalkStatus.active && <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, background: '#fff', borderRadius: '50%', animation: 'breathe 1s infinite' }} />}
                </div>
                Shadow Walk
              </button>
            </div>
          </div>
        )}

        {/* Time Pills */}
        {!isNavigating && (
          <div style={{ position: 'absolute', top: 100, left: 24, zIndex: 1000, background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', borderRadius: '30px', border: '1px solid var(--glass-border)', display: 'flex', padding: '6px' }}>
            {['Now', '8 PM', '11 PM'].map(time => (
              <button key={time} onClick={() => handleTimeSwitch(time)} className={`time-pill ${timeMode === time ? 'active' : ''}`} title={time !== 'Now' ? `${time} — Higher risk, avoid isolated routes` : 'Current time'} style={{
                background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s'
              }}>
                {time}
              </button>
            ))}
          </div>
        )}

        {/* Leaflet Map */}
        {userLocation ? (
          <div style={{ width: '100%', height: '100%', opacity: isRecalculating ? 0.7 : 1, transition: 'opacity 0.3s' }}>
            <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={14} style={{ width: '100%', height: '100%', background: '#0A0E1A' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MapController center={destination || userLocation} bounds={isNavigating && activeRoute ? activeRoute.bounds : null} navigateMode={isNavigating} />
              
              <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserMarker()} />
              
              {incidents.map((inc, i) => (
                <Marker key={i} position={inc.pos} icon={createIncidentMarker(inc.color)}>
                  <Popup className="glass-popup">
                    <div style={{ background: 'var(--bg-color)', color: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <div style={{ fontWeight: 600, color: inc.color, marginBottom: '4px' }}>{inc.type}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reported: {inc.time}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inc.count} confirmations</div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Render Routes */}
              {isNavigating ? (
                // Only render active route
                activeRoute && (
                  <Polyline 
                    key={`nav-${activeRoute.id}`}
                    positions={activeRoute.points}
                    className="route-path"
                    color={getRouteColor(activeRoute.label)}
                    weight={8}
                    opacity={1}
                  />
                )
              ) : (
                // Render all options
                routes.map(route => {
                  const isSelected = activeRoute?.id === route.id;
                  return (
                    <Polyline 
                      key={`${route.id}-${timeMode}`} // force re-render on time change for animation
                      positions={route.points}
                      className={isSelected ? 'route-path' : ''}
                      color={getRouteColor(route.label)}
                      weight={isSelected ? 6 : 4}
                      opacity={isSelected ? 1 : 0.4}
                      dashArray={isSelected ? null : "5, 10"}
                      eventHandlers={{ click: () => setActiveRoute(route) }}
                    />
                  )
                })
              )}

              {/* Invisible overlay for capturing map clicks to report */}
              {!isNavigating && (
                <div onClick={(e) => { setReportCoords(e.latlng); setReportPinOpen(true); }} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 400, cursor: 'crosshair' }} />
              )}
            </MapContainer>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="shield-spinner" size={40} color="var(--primary)" />
          </div>
        )}
      </div>

      <SafeSpotFinder isOpen={safeSpotOpen} onClose={() => setSafeSpotOpen(false)} />
      <CrowdPulse zoneId="zone_1" isOpen={crowdPulseOpen} onClose={() => setCrowdPulseOpen(false)} />
      <ReportPin isOpen={reportPinOpen} coordinates={reportCoords} onClose={() => setReportPinOpen(false)} />
      <ShadowWalkMode isOpen={shadowWalkOpen} onClose={() => setShadowWalkOpen(false)} />
    </div>
  );
}
