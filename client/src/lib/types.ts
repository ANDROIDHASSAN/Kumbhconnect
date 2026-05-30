// ─────────────────────────────────────────────────────────────
// Domain types — mirror the Supabase schema (see supabase/migrations).
// ─────────────────────────────────────────────────────────────

export type ServiceType =
  | 'rooms'
  | 'tents'
  | 'cabs'
  | 'food'
  | 'routes'
  | 'emergency'
  | 'parking';

export type BookingStatus =
  | 'lead'
  | 'quoted'
  | 'confirmed'
  | 'fulfilled'
  | 'cancelled';

export type PaymentKind = 'advance' | 'balance' | 'payout' | 'refund';
export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded';

export type Channel = 'web' | 'whatsapp' | 'phone';

export type KycStatus = 'pending' | 'verified' | 'rejected';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  language: string;
  party_size: number | null;
  segment: string | null;
  created_at: string;
}

export interface Vendor {
  id: string;
  type: ServiceType;
  name: string;
  area: string;
  lat: number | null;
  lng: number | null;
  rates_json: Record<string, number> | null;
  capacity: number | null;
  kyc_status: KycStatus;
  rating: number | null;
  active: boolean;
  image_url?: string | null;
  created_at: string;
}

export interface Inventory {
  id: string;
  vendor_id: string;
  service_type: ServiceType;
  date: string;
  units_total: number;
  units_available: number;
  price: number;
}

export interface Booking {
  id: string;
  customer_id: string | null;
  vendor_id: string | null;
  service_type: ServiceType;
  status: BookingStatus;
  start_date: string | null;
  end_date: string | null;
  party_size: number | null;
  amount: number | null;
  commission: number | null;
  channel: Channel;
  notes: string | null;
  created_at: string;
  // Convenience denormalised fields kept on the lead for the admin view.
  customer_name?: string;
  customer_phone?: string;
  area?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  kind: PaymentKind;
  amount: number;
  status: PaymentStatus;
  provider_ref: string | null;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  customer_id: string | null;
  booking_id: string | null;
  category: string;
  channel: Channel;
  status: 'open' | 'in_progress' | 'resolved';
  sla_due: string | null;
  notes: string | null;
  created_at: string;
}

export interface Promotion {
  id: string;
  vendor_id: string;
  tier: 'featured' | 'spotlight' | 'banner';
  starts_at: string;
  ends_at: string;
  amount: number;
}

// Payloads ----------------------------------------------------------------

export interface LeadInput {
  service_type: ServiceType;
  name: string;
  phone: string;
  language: string;
  party_size?: number;
  start_date?: string;
  end_date?: string;
  area?: string;
  notes?: string;
  channel?: Channel;
}

export interface VendorSignupInput {
  type: ServiceType;
  name: string;
  contact_name: string;
  phone: string;
  area: string;
  capacity?: number;
}

export type AdminRole = 'owner' | 'admin';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
}

/** The currently authenticated admin (subset carried in the token). */
export interface AdminIdentity {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

// Aggregated analytics returned by GET /api/admin/metrics.
export interface AdminMetrics {
  bookings: {
    total: number;
    byStatus: Record<BookingStatus, number>;
    won: number;
    conversionRate: number;
    gmv: number;
    commission: number;
    avgOrderValue: number;
  };
  revenueByService: Partial<Record<ServiceType, number>>;
  series: { date: string; leads: number }[];
  vendors: { total: number; active: number; byKyc: Record<KycStatus, number> };
  tickets: {
    total: number;
    byStatus: Record<SupportTicket['status'], number>;
    open: number;
  };
}
