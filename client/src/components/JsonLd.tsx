/**
 * Renders a schema.org JSON-LD block. The data is trusted, server-defined
 * content (never user input), serialised and emitted as script text content.
 * We keep all schema strings free of `&`, `<` and `>` so no escaping is needed.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  );
}

const SITE = (import.meta as any).env?.VITE_SITE_URL || 'http://localhost:5173';

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Kumbh Connect',
    description:
      'Digital help and booking service for visitors to the Nashik Trimbakeshwar Simhastha Kumbh Mela 2027.',
    url: SITE,
    areaServed: ['Nashik', 'Trimbakeshwar', 'Maharashtra, India'],
    knowsLanguage: ['en', 'hi', 'mr'],
    priceRange: 'Affordable',
  };
}

export function eventSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Nashik Trimbakeshwar Simhastha Kumbh Mela 2027',
    description:
      'A once-in-12-years Hindu pilgrimage at the Godavari ghats in Nashik and Trimbakeshwar.',
    startDate: '2027-07-01',
    endDate: '2027-09-30',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'Nashik and Trimbakeshwar',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nashik',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
    },
    organizer: { '@type': 'Organization', name: 'Kumbh Connect', url: SITE },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  };
}
