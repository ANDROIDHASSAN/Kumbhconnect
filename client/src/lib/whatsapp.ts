import type { ServiceType } from './types';

export function whatsappNumber(): string {
  return (import.meta as any).env?.VITE_WHATSAPP_NUMBER || '919999999999';
}

export function waLink(message: string, number = whatsappNumber()): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

const SERVICE_LABEL: Record<ServiceType, string> = {
  rooms: 'Room', tents: 'Tent', cabs: 'Cab/Auto', food: 'Food',
  routes: 'Route guidance', emergency: 'Emergency help', parking: 'Parking',
};

export function leadMessage(
  input: Partial<{ name: string; party_size: number; start_date: string; end_date: string; area: string; notes: string }> & { service_type: ServiceType },
  greeting?: string,
): string {
  const lines = [greeting || `Namaste! I'd like help with ${SERVICE_LABEL[input.service_type]} for the Nashik Kumbh 2027.`];
  if (input.name) lines.push(`Name: ${input.name}`);
  if (input.party_size) lines.push(`Party size: ${input.party_size}`);
  if (input.start_date) lines.push(`Date: ${input.start_date}${input.end_date ? ` to ${input.end_date}` : ''}`);
  if (input.area) lines.push(`Area: ${input.area}`);
  if (input.notes) lines.push(`Notes: ${input.notes}`);
  lines.push('(sent via Kumbh Connect)');
  return lines.join('\n');
}

export function emergencyMessage(category: string, coords?: { lat: number; lng: number }): string {
  const lines = [`🆘 EMERGENCY — ${category}. I need help at the Nashik Kumbh.`];
  if (coords) lines.push(`My location: https://maps.google.com/?q=${coords.lat},${coords.lng}`);
  lines.push('(sent via Kumbh Connect)');
  return lines.join('\n');
}
