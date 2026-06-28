import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AlertTriangle, TrendingUp, Users, Map, CheckCircle, Heart, ArrowUp, ArrowDown } from 'lucide-react';

const useCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start;
    let frame;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [end, duration]);
  return count;
};

export default function HeatmapDashboard() {
  const [view, setView] = useState('authority'); // 'community' or 'authority'

  // Data for Charts
  const peakHoursData = [
    { hour: '12AM', count: 80 }, { hour: '2AM', count: 95 }, { hour: '4AM', count: 40 },
    { hour: '6AM', count: 10 }, { hour: '8AM', count: 5 }, { hour: '10AM', count: 8 },
    { hour: '12PM', count: 15 }, { hour: '2PM', count: 20 }, { hour: '4PM', count: 25 },
    { hour: '6PM', count: 45 }, { hour: '8PM', count: 70 }, { hour: '10PM', count: 85 }
  ];
  const incidentData = [
    { name: 'Poor Lighting', value: 35, color: '#F39C12' },
    { name: 'Isolated Area', value: 25, color: '#E67E22' },
    { name: 'Harassment', value: 20, color: '#FF4D6D' },
    { name: 'No CCTV', value: 10, color: '#6C3483' },
    { name: 'No Network', value: 6, color: '#8E44AD' },
    { name: 'Blocked Path', value: 4, color: '#34495E' }
  ];
  const weeklyData = [
    { day: 'Mon', incidents: 120 }, { day: 'Tue', incidents: 105 }, { day: 'Wed', incidents: 140 },
    { day: 'Thu', incidents: 90 }, { day: 'Fri', incidents: 180 }, { day: 'Sat', incidents: 210 },
    { day: 'Sun', incidents: 160 }
  ];

  // Counters
  const reportsCount = useCounter(1245);
  const dangerZonesCount = useCounter(42);
  const activeUsersCount = useCounter(15890);
  
  const commRoutes = useCounter(24);
  const commReports = useCounter(7);
  const commAreas = useCounter(3);

  const getBarColor = (hourStr) => {
    const hr = parseInt(hourStr);
    const isPM = hourStr.includes('PM');
    if ((isPM && hr >= 9 && hr !== 12) || (!isPM && hr <= 2) || (isPM && hr === 12 && hrStr === '12AM')) return 'var(--danger)'; // 9PM-2AM
    if (isPM && hr >= 6 && hr < 9) return 'var(--warning)'; // 6PM-9PM
    return 'var(--primary)'; // Daytime
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      
      {/* Header & Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Safety Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time insights for Bengaluru.</p>
        </div>
        
        {/* Animated Toggle */}
        <div style={{ 
          position: 'relative', display: 'flex', background: 'var(--glass-bg)', 
          borderRadius: '30px', padding: '4px', border: '1px solid var(--glass-border)' 
        }}>
          <div style={{
            position: 'absolute', top: 4, left: view === 'authority' ? '4px' : 'calc(50% - 4px)',
            width: 'calc(50% - 4px)', height: 'calc(100% - 8px)', background: 'var(--primary)',
            borderRadius: '26px', transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          }} />
          <button onClick={() => setView('authority')} style={{
            flex: 1, padding: '10px 24px', background: 'none', border: 'none',
            color: view === 'authority' ? '#fff' : 'var(--text-muted)', fontWeight: 600,
            position: 'relative', zIndex: 1, cursor: 'pointer', transition: 'color 0.3s'
          }}>Authority View</button>
          <button onClick={() => setView('community')} style={{
            flex: 1, padding: '10px 24px', background: 'none', border: 'none',
            color: view === 'community' ? '#fff' : 'var(--text-muted)', fontWeight: 600,
            position: 'relative', zIndex: 1, cursor: 'pointer', transition: 'color 0.3s'
          }}>Community View</button>
        </div>
      </div>

      {view === 'authority' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeSlideUp 0.4s ease' }}>
          {/* Authority Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Total Reports Today</div><div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Clash Display' }}>{reportsCount}</div></div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,77,109,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle color="var(--danger)" /></div>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Active Danger Zones</div><div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Clash Display' }}>{dangerZonesCount}</div></div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(243,156,18,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Map color="var(--warning)" /></div>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Active Users</div><div style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'Clash Display' }}>{activeUsersCount}</div></div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(13,115,119,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users color="var(--primary)" /></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Peak Hours Chart */}
            <div className="glass-card" style={{ padding: '24px', height: '350px' }}>
              <h3 style={{ marginBottom: '24px' }}>Peak Unsafe Hours</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <XAxis dataKey="hour" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true}>
                    {peakHoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.hour)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Incident Types Donut */}
            <div className="glass-card" style={{ padding: '24px', height: '350px', position: 'relative' }}>
              <h3 style={{ marginBottom: '24px' }}>Incident Types</h3>
              <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 700, fontFamily: 'Clash Display' }}>890</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={incidentData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={true}>
                    {incidentData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Weekly Trend */}
            <div className="glass-card" style={{ padding: '24px', height: '350px' }}>
              <h3 style={{ marginBottom: '24px' }}>Weekly Trend</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="incidents" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top 5 Table */}
            <div className="glass-card" style={{ padding: '24px', height: '350px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '24px' }}>Top 5 Danger Zones</h3>
              <style>{`
                .zone-row:hover { border-left: 3px solid var(--primary) !important; background: rgba(255,255,255,0.02); }
              `}</style>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { r: 1, n: 'Koramangala 8th Block', v: 45, t: 'up', c: 'var(--danger)' },
                  { r: 2, n: 'Silk Board Junction', v: 38, t: 'up', c: '#E67E22' },
                  { r: 3, n: 'HSR Layout Sector 2', v: 29, t: 'down', c: 'var(--warning)' },
                  { r: 4, n: 'BTM 2nd Stage', v: 22, t: 'down', c: '#F1C40F' },
                  { r: 5, n: 'Indiranagar 100ft', v: 15, t: 'down', c: 'var(--primary)' }
                ].map(zone => (
                  <div key={zone.r} className="zone-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--glass-border)', borderLeft: '3px solid transparent', borderRadius: '12px', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: zone.c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>{zone.r}</div>
                      <div style={{ fontWeight: 600 }}>{zone.n}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{zone.v} reports</span>
                      {zone.t === 'up' ? <ArrowUp size={16} color="var(--danger)" /> : <ArrowDown size={16} color="var(--primary)" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeSlideUp 0.4s ease' }}>
          {/* Community Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontFamily: 'Clash Display', color: 'var(--primary)' }}>{commRoutes}</div>
              <div style={{ color: 'var(--text-muted)' }}>Routes Taken</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontFamily: 'Clash Display', color: 'var(--safe)' }}>{commReports}</div>
              <div style={{ color: 'var(--text-muted)' }}>Reports Submitted</div>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontFamily: 'Clash Display', color: 'var(--warning)' }}>{commAreas}</div>
              <div style={{ color: 'var(--text-muted)' }}>Areas Contributed</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Safety Score */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ marginBottom: '24px' }}>Your Safety Score</h3>
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="100" cy="100" r="90" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="90" fill="transparent" stroke="var(--primary)" strokeWidth="12" strokeDasharray={565.48} strokeDashoffset={565.48 - (0.87 * 565.48)} style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '48px', fontFamily: 'Clash Display', fontWeight: 700, color: 'var(--primary)' }}>87</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ 100</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '24px' }}>Excellent! You stick to well-lit, active routes.</p>
            </div>

            {/* Your Reports */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '24px' }}>Your Reports</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { type: 'Harassment', loc: 'MG Road Metro', time: '2 days ago', status: 'Verified' },
                  { type: 'Poor Lighting', loc: '100ft Road', time: '1 week ago', status: 'Verified' },
                  { type: 'Isolated Area', loc: 'Koramangala 4th', time: '2 weeks ago', status: 'Pending' }
                ].map((rep, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{rep.type}</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}><MapPin size={12} style={{ display: 'inline', marginRight: 4 }}/>{rep.loc} • {rep.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: rep.status === 'Verified' ? 'var(--safe)' : 'var(--warning)', fontSize: '14px', fontWeight: 600 }}>
                      {rep.status === 'Verified' ? <CheckCircle size={16} /> : <Loader2 size={16} />} {rep.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Safe Zones */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '24px' }}>Safe Zones Near You</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {[
                  { name: 'Koramangala Police Station', dist: '1.2 km' },
                  { name: 'Apollo 24/7 Pharmacy', dist: '0.8 km' },
                  { name: 'Nexus Mall Open Area', dist: '2.1 km' }
                ].map((zone, i) => (
                  <div key={i} style={{ flex: 1, minWidth: '150px', padding: '16px', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.3)', background: 'rgba(46, 204, 113, 0.05)', boxShadow: 'inset 0 0 10px rgba(46, 204, 113, 0.05)' }}>
                    <Shield color="var(--safe)" size={24} style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{zone.name}</div>
                    <div style={{ color: 'var(--safe)', fontSize: '14px' }}>{zone.dist}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thank You */}
            <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <style>{`
                @keyframes heartbeat { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.3); } }
              `}</style>
              <Heart size={48} color="var(--danger)" style={{ fill: 'var(--danger)', animation: 'heartbeat 1.5s infinite', marginBottom: '24px' }} />
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Community Thank You</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1.5 }}>Your 7 reports have helped <span style={{ color: '#fff', fontWeight: 700 }}>340 women</span> avoid unsafe routes this month.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
