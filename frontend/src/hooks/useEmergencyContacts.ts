import { useSafeRouteStore, type EmergencyContact } from '../store/safeRouteStore';

export function useEmergencyContacts() {
  const contacts = useSafeRouteStore((s) => s.contacts);
  const addContact = useSafeRouteStore((s) => s.addContact);
  const removeContact = useSafeRouteStore((s) => s.removeContact);
  const updateContact = useSafeRouteStore((s) => s.updateContact);

  const canProceed = contacts.length >= 2;

  const add = (data: Omit<EmergencyContact, 'id'>) => {
    if (contacts.length < 5) addContact(data);
  };

  return { contacts, add, remove: removeContact, update: updateContact, canProceed };
}
