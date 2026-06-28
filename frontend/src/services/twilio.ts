import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface SosAlertPayload {
  contacts: { name: string; phone: string }[];
  userName: string;
  lat: number;
  lng: number;
  stealth?: boolean;
  message?: string;
}

export async function sendSosAlert(payload: SosAlertPayload): Promise<{ status: string; sent?: number }> {
  const res = await axios.post(`${API_URL}/sos/broadcast`, payload, { timeout: 10000 });
  return res.data;
}

export async function cancelSosAlert(): Promise<void> {
  await axios.post(`${API_URL}/sos/cancel`, {}, { timeout: 5000 });
}

export async function sendLowBatteryAlert(payload: SosAlertPayload): Promise<void> {
  await axios.post(`${API_URL}/sos/low-battery`, payload, { timeout: 10000 });
}
