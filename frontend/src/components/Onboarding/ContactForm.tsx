import { Plus, Trash2 } from 'lucide-react';
import type { EmergencyContact } from '../../store/safeRouteStore';

interface ContactFormProps {
  contacts: EmergencyContact[];
  onAdd: (data: Omit<EmergencyContact, 'id'>) => void;
  onRemove: (id: string) => void;
}

export default function ContactForm({ contacts, onAdd, onRemove }: ContactFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const phone = String(fd.get('phone') ?? '').trim();
    const carrier = String(fd.get('carrier') ?? 'AT&T').trim();
    const relationship = String(fd.get('relationship') ?? 'Friend') as EmergencyContact['relationship'];
    if (name && phone && contacts.length < 5) {
      onAdd({ name, phone, carrier, relationship });
      e.currentTarget.reset();
    }
  };

  return (
    <div>
      <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center justify-between bg-white/5 border border-primary/20 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary mr-3 shrink-0">
              {c.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{c.name}</div>
              <div className="text-sm text-textMuted">{c.relationship} · {c.phone}</div>
            </div>
            <button type="button" onClick={() => onRemove(c.id)} className="text-danger p-2 hover:bg-danger/10 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {contacts.length === 0 && <div className="text-center text-textMuted py-4">No contacts added yet.</div>}
      </div>
      {contacts.length < 5 && (
        <form onSubmit={handleSubmit} className="bg-background/50 border border-white/10 rounded-xl p-4 space-y-3">
          <input name="name" required placeholder="Contact Name" className="w-full bg-white/5 border border-white/10 rounded-lg p-2 outline-none focus:border-primary" />
          <div className="flex gap-2">
            <input name="phone" required type="tel" placeholder="+91 98765 43210" className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 outline-none focus:border-primary" />
            <select name="carrier" className="bg-black border border-primary/20 rounded-lg p-2 outline-none text-white text-sm">
              <option value="AT&T" className="bg-gray-900 text-white">AT&T</option>
              <option value="Verizon" className="bg-gray-900 text-white">Verizon</option>
              <option value="T-Mobile" className="bg-gray-900 text-white">T-Mobile</option>
              <option value="Sprint" className="bg-gray-900 text-white">Sprint</option>
              <option value="Virgin" className="bg-gray-900 text-white">Virgin Mobile</option>
            </select>
            <select name="relationship" className="bg-black border border-primary/20 rounded-lg p-2 outline-none text-white text-sm">
              <option value="Guardian" className="bg-gray-900 text-white">Guardian</option>
              <option value="Trusted" className="bg-gray-900 text-white">Trusted</option>
              <option value="Emergency Only" className="bg-gray-900 text-white">Emergency Only</option>
              <option value="Friend" className="bg-gray-900 text-white">Friend</option>
              <option value="Partner" className="bg-gray-900 text-white">Partner</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-white/10 text-primary font-bold py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus size={18} /> Add Contact
          </button>
        </form>
      )}
    </div>
  );
}
