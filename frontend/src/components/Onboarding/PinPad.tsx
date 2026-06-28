import { Delete } from 'lucide-react';

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export default function PinPad({ value, onChange, maxLength = 4, disabled = false }: PinPadProps) {
  const digits = value.split('');

  const appendDigit = (digit: string) => {
    if (disabled || value.length >= maxLength) return;
    onChange(value + digit);
  };

  const removeDigit = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      appendDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      removeDigit();
    }
  };

  return (
    <div className="w-full" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex justify-center gap-3 sm:gap-4 mb-8">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-mono transition-all duration-200 ${
              digits.length > i
                ? 'border-primary bg-primary/20 scale-105'
                : digits.length === i
                  ? 'border-primary/60 bg-white/5 animate-pulse'
                  : 'border-white/20 bg-white/5'
            }`}
          >
            {digits.length > i ? (
              <span className="w-3 h-3 rounded-full bg-primary" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled || value.length >= maxLength}
            onClick={() => appendDigit(digit)}
            className="h-14 rounded-xl bg-white/5 border border-white/10 text-xl font-bold text-textMain hover:bg-white/10 hover:border-primary/50 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={removeDigit}
          className="h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-textMuted hover:bg-danger/10 hover:border-danger/30 hover:text-danger active:scale-95 transition-all disabled:opacity-40"
          aria-label="Delete last digit"
        >
          <Delete size={22} />
        </button>
        <button
          type="button"
          disabled={disabled || value.length >= maxLength}
          onClick={() => appendDigit('0')}
          className="h-14 rounded-xl bg-white/5 border border-white/10 text-xl font-bold text-textMain hover:bg-white/10 hover:border-primary/50 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
        >
          0
        </button>
        <div className="h-14" aria-hidden />
      </div>
    </div>
  );
}
