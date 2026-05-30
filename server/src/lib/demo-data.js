// ─────────────────────────────────────────────────────────────
// Demo dataset — realistic pilgrims, bookings, tickets and promos used to
// populate a fresh database (and the file store) so the admin dashboard has
// meaningful numbers out of the box.
//
// Bookings reference a customer by array index and (optionally) a seeded
// vendor by name. `days_ago` becomes the row's created_at so the 30-day
// trend, funnel and revenue charts all show real movement.
// ─────────────────────────────────────────────────────────────

export const DEMO_CUSTOMERS = [
  { name: 'Ramesh Patil', phone: '9820012345', language: 'mr', party_size: 4, segment: 'family' },
  { name: 'Sunita Sharma', phone: '9811023456', language: 'hi', party_size: 2, segment: 'couple' },
  { name: 'Anil Deshmukh', phone: '9890034567', language: 'mr', party_size: 6, segment: 'group' },
  { name: 'Priya Iyer', phone: '9745045678', language: 'en', party_size: 3, segment: 'family' },
  { name: 'Mohammed Khan', phone: '9822056789', language: 'hi', party_size: 2, segment: 'couple' },
  { name: 'Lakshmi Nair', phone: '9961067890', language: 'en', party_size: 5, segment: 'family' },
  { name: 'Vijay Kulkarni', phone: '9730078901', language: 'mr', party_size: 1, segment: 'solo' },
  { name: 'Geeta Joshi', phone: '9421089012', language: 'hi', party_size: 8, segment: 'group' },
  { name: 'Sanjay Gupta', phone: '9818090123', language: 'hi', party_size: 2, segment: 'senior' },
  { name: 'Meera Reddy', phone: '9849001234', language: 'en', party_size: 4, segment: 'family' },
  { name: 'Arjun Singh', phone: '9876512345', language: 'hi', party_size: 3, segment: 'family' },
  { name: 'Kavita Bhosale', phone: '9764523456', language: 'mr', party_size: 2, segment: 'couple' },
];

// status spread is intentional: a healthy funnel with a couple of cancellations.
export const DEMO_BOOKINGS = [
  { customer: 0, service_type: 'rooms', vendor: 'Godavari Riverside Lodge', status: 'fulfilled', start_date: '2027-08-02', party_size: 4, amount: 5600, channel: 'web', notes: 'Elderly parents — ground floor preferred', days_ago: 27 },
  { customer: 1, service_type: 'tents', vendor: 'Sadhugram Deluxe Tents', status: 'fulfilled', start_date: '2027-08-03', party_size: 2, amount: 4200, channel: 'whatsapp', notes: 'Honeymoon — deluxe tent', days_ago: 25 },
  { customer: 2, service_type: 'cabs', vendor: 'Trimbak Yatra Travels', status: 'confirmed', start_date: '2027-08-05', party_size: 6, amount: 2500, channel: 'phone', notes: 'Tempo traveller, station pickup 6am', days_ago: 22 },
  { customer: 3, service_type: 'food', vendor: 'Annapurna Sattvic Kitchen', status: 'fulfilled', start_date: '2027-08-04', party_size: 3, amount: 450, channel: 'web', notes: 'Jain thali x3', days_ago: 20 },
  { customer: 4, service_type: 'rooms', vendor: 'Trimbak Heritage Stay', status: 'confirmed', start_date: '2027-08-06', party_size: 2, amount: 4400, channel: 'web', notes: null, days_ago: 18 },
  { customer: 5, service_type: 'rooms', vendor: 'Ganga Ghat Comfort Inn', status: 'confirmed', start_date: '2027-08-07', party_size: 5, amount: 7800, channel: 'whatsapp', notes: 'Two connecting rooms', days_ago: 16 },
  { customer: 6, service_type: 'parking', vendor: 'Tapovan Outer Parking P1', status: 'fulfilled', start_date: '2027-08-02', party_size: 1, amount: 200, channel: 'web', notes: 'Car, overnight', days_ago: 15 },
  { customer: 7, service_type: 'tents', vendor: 'Pilgrim Base Camp', status: 'quoted', start_date: '2027-08-10', party_size: 8, amount: 8800, channel: 'phone', notes: 'Group of 8, dormitory', days_ago: 13 },
  { customer: 8, service_type: 'cabs', vendor: 'Senior-Care Rides', status: 'confirmed', start_date: '2027-08-08', party_size: 2, amount: 950, channel: 'phone', notes: 'Wheelchair-accessible vehicle', days_ago: 12 },
  { customer: 9, service_type: 'rooms', vendor: 'Shanti Homestay', status: 'quoted', start_date: '2027-08-12', party_size: 4, amount: 4800, channel: 'web', notes: null, days_ago: 10 },
  { customer: 10, service_type: 'food', vendor: 'Maharaj Bhojanalaya', status: 'lead', start_date: '2027-08-11', party_size: 3, amount: 540, channel: 'whatsapp', notes: 'Bulk prasad order enquiry', days_ago: 9 },
  { customer: 11, service_type: 'tents', vendor: 'Riverview Tent City', status: 'confirmed', start_date: '2027-08-09', party_size: 2, amount: 2800, channel: 'web', notes: null, days_ago: 8 },
  { customer: 0, service_type: 'cabs', vendor: 'Nashik City Cabs', status: 'lead', start_date: '2027-08-14', party_size: 4, amount: 1100, channel: 'web', notes: 'SUV for ghat drop', days_ago: 7 },
  { customer: 2, service_type: 'rooms', vendor: 'Godavari Riverside Lodge', status: 'cancelled', start_date: '2027-08-15', party_size: 6, amount: 8400, channel: 'phone', notes: 'Cancelled — dates changed', days_ago: 6 },
  { customer: 3, service_type: 'parking', vendor: 'Trimbak Highway Parking', status: 'lead', start_date: '2027-08-13', party_size: 1, amount: 150, channel: 'web', notes: null, days_ago: 5 },
  { customer: 5, service_type: 'tents', vendor: 'Sadhugram Deluxe Tents', status: 'quoted', start_date: '2027-08-16', party_size: 5, amount: 7000, channel: 'whatsapp', notes: 'Family — 2 private tents', days_ago: 4 },
  { customer: 6, service_type: 'food', vendor: 'Annapurna Sattvic Kitchen', status: 'lead', start_date: '2027-08-12', party_size: 1, amount: 150, channel: 'web', notes: null, days_ago: 3 },
  { customer: 8, service_type: 'rooms', vendor: 'Trimbak Heritage Stay', status: 'lead', start_date: '2027-08-18', party_size: 2, amount: 4400, channel: 'web', notes: 'Senior couple', days_ago: 2 },
  { customer: 10, service_type: 'cabs', vendor: 'Trimbak Yatra Travels', status: 'quoted', start_date: '2027-08-17', party_size: 3, amount: 800, channel: 'phone', notes: null, days_ago: 1 },
  { customer: 11, service_type: 'rooms', vendor: 'Ganga Ghat Comfort Inn', status: 'lead', start_date: '2027-08-20', party_size: 2, amount: 2600, channel: 'whatsapp', notes: 'Enquiry via WhatsApp', days_ago: 0 },
  { customer: 1, service_type: 'cabs', vendor: 'Nashik City Cabs', status: 'lead', start_date: '2027-08-19', party_size: 2, amount: 600, channel: 'web', notes: null, days_ago: 0 },
];

export const DEMO_TICKETS = [
  { customer: 0, category: 'booking', channel: 'whatsapp', status: 'resolved', notes: 'Asked to change check-in date — done', days_ago: 21 },
  { customer: 3, category: 'medical', channel: 'phone', status: 'resolved', notes: 'Connected to Ramkund medical camp', days_ago: 14 },
  { customer: 7, category: 'payment', channel: 'web', status: 'in_progress', notes: 'Advance paid but receipt not received', days_ago: 6 },
  { customer: 8, category: 'lost', channel: 'phone', status: 'in_progress', notes: 'Lost bag near Kushavarta ghat', days_ago: 3 },
  { customer: 10, category: 'booking', channel: 'whatsapp', status: 'open', notes: 'Wants to add 2 more guests', days_ago: 2 },
  { customer: 11, category: 'other', channel: 'web', status: 'open', notes: 'Question about shuttle timings', days_ago: 1 },
];

export const DEMO_PROMOTIONS = [
  { vendor: 'Godavari Riverside Lodge', tier: 'featured', durationDays: 30, amount: 5000 },
  { vendor: 'Sadhugram Deluxe Tents', tier: 'spotlight', durationDays: 21, amount: 3500 },
];
