import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, MapPin, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveTracker() {
  const { id } = useParams<{ id: string }>();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket Server
    const ws = new WebSocket(`ws://localhost:8000/ws/track/${id}`);

    ws.onopen = () => setConnected(true);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.lat && data.lng) {
          setLocation({ lat: data.lat, lng: data.lng });
        }
      } catch (e) {
        console.error("Failed to parse websocket message", e);
      }
    };

    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
    };
  }, [id]);

  return (
    <div className="h-screen w-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Simulation of a Map Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #2a2a2a 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
      
      <div className="z-10 bg-surface/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4 shadow-2xl">
        <Shield size={48} className="text-danger mb-4" />
        <h1 className="text-2xl font-black text-white mb-2">Live SOS Tracker</h1>
        <p className="text-textMuted text-center mb-8">
          {connected ? "Connected to Emergency Beacon." : "Connecting to beacon..."}
        </p>

        {location ? (
          <div className="w-full bg-black/50 p-6 rounded-2xl border border-primary/20 relative flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 rounded-full bg-danger/20 flex items-center justify-center mb-4 relative"
            >
              <div className="w-8 h-8 rounded-full bg-danger flex items-center justify-center relative z-10">
                <Navigation size={16} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-danger animate-ping" />
            </motion.div>
            
            <div className="flex items-center gap-2 text-white font-mono text-sm mb-4">
              <MapPin size={16} className="text-primary" />
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>

            <a 
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank" rel="noreferrer"
              className="w-full bg-primary text-background font-bold py-3 rounded-xl text-center hover:bg-primary/90 transition-colors"
            >
              Open in Google Maps
            </a>
          </div>
        ) : (
          <div className="text-textMuted flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            Waiting for GPS signal...
          </div>
        )}
      </div>
    </div>
  );
}
