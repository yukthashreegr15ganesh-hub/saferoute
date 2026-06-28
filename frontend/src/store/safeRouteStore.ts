import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GuardianMode = 'solo' | 'night' | 'group';
export type SentinelRole = 'Guardian' | 'Trusted' | 'Emergency Only' | 'Mother' | 'Father' | 'Friend' | 'Partner' | 'Other';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  carrier: string;
  relationship: SentinelRole;
  online?: boolean;
}

export interface RouteLog {
  id: string;
  date: string;
  start: string;
  destination: string;
  score: number;
}

export interface AlertLog {
  id: string;
  date: string;
  type: 'SOS' | 'ShadowWalk_Timeout' | 'LowBattery';
  resolved?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  guardianLevel?: 'Recruit' | 'Sentinel' | 'Guardian' | 'Elite Guardian';
}

export interface MapLayers {
  crowdIntel: boolean;
  threatZones: boolean;
  sentinelSpots: boolean;
  ghostWalk: boolean;
  cctvGrid: boolean;
  escapeRoutes: boolean;
}

export interface JourneyStats {
  distanceKm: number;
  zonesCrossed: number;
  alertsAvoided: number;
}

interface SafeRouteState {
  hasOnboarded: boolean;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  guardianMode: GuardianMode | null;
  setGuardianMode: (mode: GuardianMode) => void;
  pin: string | null;
  setPin: (pin: string) => void;
  verifyPin: (attempt: string) => boolean;
  decoyPin: string | null;
  setDecoyPin: (pin: string) => void;
  verifyDecoyPin: (attempt: string) => boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  startFromBeginning: () => Promise<void>;

  contacts: EmergencyContact[];
  addContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, data: Partial<Omit<EmergencyContact, 'id'>>) => void;

  permissions: { location: boolean; microphone: boolean; notifications: boolean };
  setPermission: (key: keyof SafeRouteState['permissions'], granted: boolean) => void;

  shareLiveLocation: boolean;
  toggleLiveLocation: () => void;
  nightModeAutoLock: boolean;
  toggleNightModeAutoLock: () => void;
  mapLayers: MapLayers;
  toggleMapLayer: (key: keyof MapLayers) => void;

  ariaOnboarded: boolean;
  setAriaOnboarded: (v: boolean) => void;
  ariaWhisperMode: boolean;
  toggleAriaWhisper: () => void;

  sosActive: boolean;
  sosStealth: boolean;
  setSosActive: (active: boolean) => void;
  setSosStealth: (v: boolean) => void;

  routeHistory: RouteLog[];
  alertHistory: AlertLog[];
  journeyStats: JourneyStats;
  achievements: string[];
  unlockAchievement: (id: string) => void;
  addRouteLog: (log: Omit<RouteLog, 'id' | 'date'>) => void;
  addAlertLog: (log: Omit<AlertLog, 'id' | 'date'>) => void;
  incrementJourney: (partial: Partial<JourneyStats>) => void;
}

const defaultLayers: MapLayers = {
  crowdIntel: false,
  threatZones: false,
  sentinelSpots: true,
  ghostWalk: false,
  cctvGrid: false,
  escapeRoutes: false,
};

export const useSafeRouteStore = create<SafeRouteState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      userProfile: null,
      setUserProfile: (profile) => set({ userProfile: profile }),
      guardianMode: null,
      setGuardianMode: (mode) => set({ guardianMode: mode }),

      pin: null,
      setPin: (pin) => set({ pin: pin.replace(/\D/g, '').slice(0, 4) }),
      verifyPin: (attempt): boolean => {
        const stored = get().pin;
        if (!stored || stored.length !== 4) return false;
        return stored === attempt.replace(/\D/g, '').slice(0, 4);
      },
      decoyPin: null,
      setDecoyPin: (pin) => set({ decoyPin: pin.replace(/\D/g, '').slice(0, 4) }),
      verifyDecoyPin: (attempt): boolean => {
        const stored = get().decoyPin;
        if (!stored || stored.length !== 4) return false;
        return stored === attempt.replace(/\D/g, '').slice(0, 4);
      },
      token: null,
      setToken: (token) => set({ token }),
      completeOnboarding: () => {
        const contacts = get().contacts;
        const achievements: string[] = [];
        if (contacts.length >= 5) achievements.push('sentinel-builder');
        set({ hasOnboarded: true, achievements: [...new Set([...get().achievements, ...achievements])] });
      },
      resetOnboarding: () =>
        set({
          hasOnboarded: false,
          userProfile: null,
          guardianMode: null,
          pin: null,
          decoyPin: null,
          token: null,
          contacts: [],
          permissions: { location: false, microphone: false, notifications: false },
          routeHistory: [],
          alertHistory: [],
          sosActive: false,
          shareLiveLocation: true,
          mapLayers: defaultLayers,
        }),
      startFromBeginning: async () => {
        await useSafeRouteStore.persist.clearStorage();
        set({
          hasOnboarded: false,
          userProfile: null,
          guardianMode: null,
          pin: null,
          decoyPin: null,
          token: null,
          contacts: [],
          permissions: { location: false, microphone: false, notifications: false },
          routeHistory: [],
          alertHistory: [],
          sosActive: false,
          shareLiveLocation: true,
          mapLayers: defaultLayers,
          journeyStats: { distanceKm: 0, zonesCrossed: 0, alertsAvoided: 0 },
          achievements: [],
        });
      },

      contacts: [],
      addContact: (contact) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : Date.now().toString(36) + Math.random().toString(36).slice(2);
        set((state) => ({
          contacts: [...state.contacts, { ...contact, id, online: Math.random() > 0.4 }],
        }));
        // Sync to backend
        fetch('http://localhost:8000/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact)
        }).catch(console.error);
      },
      removeContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),
      updateContact: (id, data) =>
        set((state) => ({ contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...data } : c)) })),

      permissions: { location: false, microphone: false, notifications: false },
      setPermission: (key, granted) =>
        set((state) => ({ permissions: { ...state.permissions, [key]: granted } })),

      shareLiveLocation: true,
      toggleLiveLocation: () => set((state) => ({ shareLiveLocation: !state.shareLiveLocation })),
      nightModeAutoLock: false,
      toggleNightModeAutoLock: () => set((state) => ({ nightModeAutoLock: !state.nightModeAutoLock })),

      mapLayers: defaultLayers,
      toggleMapLayer: (key) =>
        set((state) => ({ mapLayers: { ...state.mapLayers, [key]: !state.mapLayers[key] } })),

      ariaOnboarded: false,
      setAriaOnboarded: (v) => set({ ariaOnboarded: v }),
      ariaWhisperMode: false,
      toggleAriaWhisper: () => set((state) => ({ ariaWhisperMode: !state.ariaWhisperMode })),

      sosActive: false,
      sosStealth: false,
      setSosActive: (active) => set({ sosActive: active }),
      setSosStealth: (v) => set({ sosStealth: v }),

      routeHistory: [],
      alertHistory: [],
      journeyStats: { distanceKm: 12.4, zonesCrossed: 8, alertsAvoided: 3 },
      achievements: [],
      unlockAchievement: (id) =>
        set((state) => ({ achievements: [...new Set([...state.achievements, id])] })),
      addRouteLog: (log) =>
        set((state) => ({
          routeHistory: [{ ...log, id: crypto.randomUUID(), date: new Date().toISOString() }, ...state.routeHistory],
          journeyStats: {
            ...state.journeyStats,
            distanceKm: state.journeyStats.distanceKm + (parseFloat(log.score.toString()) > 0 ? 2.1 : 0),
            zonesCrossed: state.journeyStats.zonesCrossed + 1,
          },
        })),
      addAlertLog: (log) =>
        set((state) => ({
          alertHistory: [{ ...log, id: crypto.randomUUID(), date: new Date().toISOString(), resolved: false }, ...state.alertHistory],
        })),
      incrementJourney: (partial) =>
        set((state) => ({ journeyStats: { ...state.journeyStats, ...partial } })),
    }),
    {
      name: 'saferoute-storage',
      version: 2,
      migrate: (persisted) => {
        const p = { ...(persisted as object) } as Record<string, unknown>;
        const oldLayers = p.mapLayers as Record<string, boolean> | undefined;
        if (oldLayers && !('sentinelSpots' in oldLayers)) {
          p.mapLayers = {
            crowdIntel: oldLayers.crowdPulse ?? false,
            threatZones: false,
            sentinelSpots: oldLayers.safeSpots ?? true,
            ghostWalk: oldLayers.shadowWalk ?? false,
            cctvGrid: false,
            escapeRoutes: false,
          };
        }
        if (p.safeBotOnboarded !== undefined) {
          p.ariaOnboarded = p.safeBotOnboarded;
        }
        return p;
      },
      partialize: (state) => ({
        hasOnboarded: state.hasOnboarded,
        userProfile: state.userProfile,
        guardianMode: state.guardianMode,
        pin: state.pin,
        decoyPin: state.decoyPin,
        token: state.token,
        contacts: state.contacts,
        permissions: state.permissions,
        shareLiveLocation: state.shareLiveLocation,
        nightModeAutoLock: state.nightModeAutoLock,
        mapLayers: state.mapLayers,
        ariaOnboarded: state.ariaOnboarded,
        ariaWhisperMode: state.ariaWhisperMode,
        routeHistory: state.routeHistory,
        alertHistory: state.alertHistory,
        journeyStats: state.journeyStats,
        achievements: state.achievements,
      }),
    }
  )
);

// Back-compat aliases
export const useSafeBotOnboarded = () => {
  const v = useSafeRouteStore((s) => s.ariaOnboarded);
  const set = useSafeRouteStore((s) => s.setAriaOnboarded);
  return [v, set] as const;
};
