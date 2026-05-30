// Thin API client for the Express server. In dev, Vite proxies /api → :4000.
import type { Booking, Vendor, SupportTicket, ServiceType, AdminMetrics, Admin, AdminIdentity } from './types';

const BASE = (import.meta as any).env?.VITE_API_URL || '';

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...adminHeader(), ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.error || res.statusText);
  }
  return res.json();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ── Admin token (persisted in localStorage) ──
const TOKEN_KEY = 'kc-admin-token';
export const getToken = () => (typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};
function adminHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ── Public ──
export const getServiceVendors = (slug: ServiceType) =>
  req<{ vendors: Vendor[] }>(`/services/${slug}/vendors`).then((r) => r.vendors);

export const getEmergencyDesks = () =>
  req<{ desks: any[] }>(`/emergency/desks`).then((r) => r.desks);

export const submitLead = (payload: Record<string, unknown>) =>
  req<{ booking: Booking }>(`/leads`, { method: 'POST', body: JSON.stringify(payload) });

export const submitVendor = (payload: Record<string, unknown>) =>
  req<{ vendor: Vendor }>(`/vendors`, { method: 'POST', body: JSON.stringify(payload) });

export const createPayment = (booking_id: string, amount: number) =>
  req<{ stubbed: boolean; amount: number; upiLink?: string }>(`/payments`, {
    method: 'POST',
    body: JSON.stringify({ booking_id, amount }),
  });

// ── Admin ──
export const adminLogin = (email: string, password: string) =>
  req<{ ok: boolean; token: string; admin: AdminIdentity }>(`/admin/login`, { method: 'POST', body: JSON.stringify({ email, password }) });

export const adminMe = () => req<{ admin: AdminIdentity }>(`/admin/me`).then((r) => r.admin);

// Admin account management
export const adminListAdmins = () => req<{ admins: Admin[] }>(`/admin/admins`).then((r) => r.admins);
export const adminCreateAdmin = (a: { name: string; email: string; password: string; role?: string }) =>
  req<{ admin: Admin }>(`/admin/admins`, { method: 'POST', body: JSON.stringify(a) });
export const adminUpdateAdmin = (id: string, patch: Record<string, unknown>) =>
  req(`/admin/admins/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const adminDeleteAdmin = (id: string) => req(`/admin/admins/${id}`, { method: 'DELETE' });

export const adminData = () =>
  req<{ bookings: Booking[]; vendors: Vendor[]; tickets: SupportTicket[]; usingPg: boolean }>(`/admin/data`);

export const adminMetrics = (days = 30) => req<AdminMetrics>(`/admin/metrics?days=${days}`);

export const adminSession = () => req<{ ok: boolean }>(`/admin/session`);

// ── Image uploads (Cloudinary signed direct upload) ──
type UploadSig = { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
export const adminSignUpload = () => req<UploadSig>(`/admin/uploads/sign`, { method: 'POST' });

/**
 * Upload an image straight to Cloudinary using a server-minted signature, and
 * return the hosted secure_url. Throws an ApiError with a friendly message when
 * uploads aren't configured (the caller can then fall back to a URL field).
 * Note: uses raw fetch — our admin bearer token must NOT be sent to Cloudinary.
 */
export async function adminUploadImage(file: File): Promise<string> {
  const sig = await adminSignUpload();
  const fd = new FormData();
  fd.append('file', file);
  fd.append('api_key', sig.apiKey);
  fd.append('timestamp', String(sig.timestamp));
  fd.append('folder', sig.folder);
  fd.append('signature', sig.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new Error(body?.error?.message || 'Image upload failed.');
  }
  const data = await res.json();
  return data.secure_url as string;
}

export const adminAddVendor = (v: Record<string, unknown>) => req(`/admin/vendors`, { method: 'POST', body: JSON.stringify(v) });
export const adminPatchVendor = (id: string, patch: Record<string, unknown>) => req(`/admin/vendors/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const adminVerifyVendor = (id: string) => req(`/admin/vendors/${id}/verify`, { method: 'POST' });
export const adminDeleteVendor = (id: string) => req(`/admin/vendors/${id}`, { method: 'DELETE' });

export const adminAddBooking = (b: Record<string, unknown>) => req(`/admin/bookings`, { method: 'POST', body: JSON.stringify(b) });
export const adminPatchBooking = (id: string, status: string) => req(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const adminDeleteBooking = (id: string) => req(`/admin/bookings/${id}`, { method: 'DELETE' });

export const adminAddTicket = (t: Record<string, unknown>) => req(`/admin/tickets`, { method: 'POST', body: JSON.stringify(t) });
export const adminPatchTicket = (id: string, status: string) => req(`/admin/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const adminDeleteTicket = (id: string) => req(`/admin/tickets/${id}`, { method: 'DELETE' });
