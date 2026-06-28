import { TRANSPORT_MODES, type TransportMode } from '../../services/transportModes';

interface TransportModePickerProps {
  value: TransportMode;
  onChange: (mode: TransportMode) => void;
}

export default function TransportModePicker({ value, onChange }: TransportModePickerProps) {
  return (
    <div className="flex flex-wrap gap-2 pointer-events-auto">
      {TRANSPORT_MODES.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            title={m.description}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold min-h-[40px] transition-all ${
              active ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'glass-panel hover:bg-white/10'
            }`}
          >
            <Icon size={14} />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
