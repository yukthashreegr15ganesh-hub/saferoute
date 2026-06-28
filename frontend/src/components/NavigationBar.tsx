import { Link, useLocation } from 'react-router-dom';
import { Map, LayoutDashboard, Shield, Home, Radio, Users, FileWarning } from 'lucide-react';
import { useSafeRouteStore } from '../store/safeRouteStore';

const links = [
  { path: '/home', label: 'Ops', icon: Home },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/zone', label: 'Intel', icon: Radio },
  { path: '/sentinels', label: 'Sentinels', icon: Users },
  { path: '/dashboard', label: 'Command', icon: LayoutDashboard },
];

export default function NavigationBar() {
  const location = useLocation();
  const nightMode = useSafeRouteStore((s) => s.nightModeAutoLock);

  return (
    <nav
      className={`backdrop-blur-xl border-b px-2 md:px-4 py-2 flex items-center justify-between z-50 shrink-0 ${
        nightMode ? 'night-ops border-danger/20' : 'bg-card/80 border-primary/10'
      }`}
    >
      <Link to="/home" className="flex items-center gap-2 text-primary font-heading text-base md:text-lg font-bold shrink-0">
        <Shield size={22} />
        <span className="hidden sm:inline">SafeRoute</span>
      </Link>

      <div className="flex gap-0.5 md:gap-1 overflow-x-auto max-w-[70vw] md:max-w-none scrollbar-hide">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1 px-2 md:px-3 py-2 rounded-full transition-all min-h-[40px] text-xs md:text-sm whitespace-nowrap ${
                isActive
                  ? 'bg-primary/20 text-primary font-bold nav-underline'
                  : 'text-textMuted hover:bg-white/5 hover:text-textMain'
              }`}
            >
              <Icon size={16} />
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          );
        })}
        <Link
          to="/report"
          className={`flex items-center gap-1 px-2 py-2 rounded-full text-xs ${
            location.pathname === '/report' ? 'text-warning' : 'text-textMuted'
          }`}
        >
          <FileWarning size={16} />
        </Link>
      </div>
    </nav>
  );
}
