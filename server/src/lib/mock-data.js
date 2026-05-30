// Sample Nashik / Trimbakeshwar vendors + inventory. Used to seed Postgres
// and as the file-fallback dataset when no DATABASE_URL is set.

export const MOCK_VENDORS = [
  { id: 'v-rooms-1', type: 'rooms', name: 'Godavari Riverside Lodge', area: 'Panchavati, near Ramkund', lat: 20.0089, lng: 73.7926, rates_json: { standard: 1800, deluxe: 2800 }, capacity: 40, kyc_status: 'verified', rating: 4.5, active: true },
  { id: 'v-rooms-2', type: 'rooms', name: 'Trimbak Heritage Stay', area: 'Trimbakeshwar town', lat: 19.9333, lng: 73.5294, rates_json: { standard: 2200, family: 3600 }, capacity: 28, kyc_status: 'verified', rating: 4.3, active: true },
  { id: 'v-rooms-3', type: 'rooms', name: 'Shanti Homestay', area: 'College Road, Nashik', lat: 20.0010, lng: 73.7560, rates_json: { room: 1200 }, capacity: 12, kyc_status: 'verified', rating: 4.7, active: true },
  { id: 'v-rooms-4', type: 'rooms', name: 'Ganga Ghat Comfort Inn', area: 'Panchavati', lat: 20.0075, lng: 73.7950, rates_json: { standard: 2600, suite: 5800 }, capacity: 55, kyc_status: 'verified', rating: 4.2, active: true },
  { id: 'v-tents-1', type: 'tents', name: 'Sadhugram Deluxe Tents', area: 'Tapovan tent city', lat: 20.0200, lng: 73.8100, rates_json: { dorm: 900, private: 2400, deluxe: 4200 }, capacity: 120, kyc_status: 'verified', rating: 4.1, active: true },
  { id: 'v-tents-2', type: 'tents', name: 'Riverview Tent City', area: 'Near Kushavarta, Trimbak', lat: 19.9300, lng: 73.5310, rates_json: { private: 2800, deluxe: 4500 }, capacity: 80, kyc_status: 'verified', rating: 4.4, active: true },
  { id: 'v-tents-3', type: 'tents', name: 'Pilgrim Base Camp', area: 'Tapovan', lat: 20.0220, lng: 73.8130, rates_json: { dorm: 1100, private: 2600 }, capacity: 200, kyc_status: 'pending', rating: 3.9, active: true },
  { id: 'v-cabs-1', type: 'cabs', name: 'Nashik City Cabs', area: 'Nashik Road station', lat: 19.9483, lng: 73.8400, rates_json: { auto: 150, sedan: 600, suv: 1100 }, capacity: 30, kyc_status: 'verified', rating: 4.3, active: true },
  { id: 'v-cabs-2', type: 'cabs', name: 'Trimbak Yatra Travels', area: 'Trimbakeshwar', lat: 19.9340, lng: 73.5280, rates_json: { sedan: 800, suv: 1400, tempo: 2500 }, capacity: 18, kyc_status: 'verified', rating: 4.5, active: true },
  { id: 'v-cabs-3', type: 'cabs', name: 'Senior-Care Rides', area: 'Nashik city', lat: 20.0050, lng: 73.7900, rates_json: { sedan: 700, wheelchair: 950 }, capacity: 10, kyc_status: 'verified', rating: 4.8, active: true },
  { id: 'v-food-1', type: 'food', name: 'Annapurna Sattvic Kitchen', area: 'Panchavati', lat: 20.0080, lng: 73.7930, rates_json: { thali: 150, prasad: 80, bulk: 120 }, capacity: 500, kyc_status: 'verified', rating: 4.6, active: true },
  { id: 'v-food-2', type: 'food', name: 'Maharaj Bhojanalaya', area: 'Trimbakeshwar', lat: 19.9330, lng: 73.5300, rates_json: { thali: 180, special: 350 }, capacity: 300, kyc_status: 'verified', rating: 4.2, active: true },
  { id: 'v-parking-1', type: 'parking', name: 'Tapovan Outer Parking P1', area: 'Tapovan outer ring', lat: 20.0300, lng: 73.8200, rates_json: { car: 200, bus: 500, twowheeler: 50 }, capacity: 2000, kyc_status: 'verified', rating: 4.0, active: true },
  { id: 'v-parking-2', type: 'parking', name: 'Trimbak Highway Parking', area: 'Nashik–Trimbak road', lat: 19.9500, lng: 73.6000, rates_json: { car: 150, bus: 400 }, capacity: 1500, kyc_status: 'verified', rating: 3.8, active: true },
];

function datePlus(days) {
  const base = new Date('2027-08-01T00:00:00Z');
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

export const MOCK_INVENTORY = MOCK_VENDORS.flatMap((v, vi) =>
  Array.from({ length: 5 }).map((_, d) => {
    const rates = v.rates_json ? Object.values(v.rates_json) : [1000];
    const price = rates[0] ?? 1000;
    const total = Math.max(5, Math.round((v.capacity ?? 20) / 4));
    return {
      id: `inv-${v.id}-${d}`,
      vendor_id: v.id,
      service_type: v.type,
      date: datePlus(d + (vi % 3)),
      units_total: total,
      units_available: Math.max(0, total - ((vi + d) % 4)),
      price,
    };
  }),
);

export const HELP_DESKS = [
  { id: 'med-1', category: 'medical', name: 'Ramkund Medical Camp', area: 'Panchavati', phone: '+911234500001', lat: 20.0088, lng: 73.7925 },
  { id: 'med-2', category: 'medical', name: 'Trimbak Civil Health Post', area: 'Trimbakeshwar', phone: '+911234500002', lat: 19.9335, lng: 73.5292 },
  { id: 'pol-1', category: 'police', name: 'Panchavati Police Help Point', area: 'Panchavati', phone: '+911234500011', lat: 20.0070, lng: 73.7940 },
  { id: 'pol-2', category: 'police', name: 'Trimbak Mela Police Post', area: 'Kushavarta', phone: '+911234500012', lat: 19.9302, lng: 73.5305 },
  { id: 'lost-1', category: 'lost', name: 'Lost & Found Centre — Tapovan', area: 'Tapovan', phone: '+911234500021', lat: 20.0205, lng: 73.8105 },
  { id: 'lost-2', category: 'lost', name: 'Lost & Found Centre — Trimbak', area: 'Trimbakeshwar', phone: '+911234500022', lat: 19.9331, lng: 73.5298 },
];
