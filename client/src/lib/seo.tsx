import { useEffect } from 'react';

const SITE = (import.meta as any).env?.VITE_SITE_URL || 'https://kumbhconnect.in';
const DEFAULT_OG = `${SITE}/og.jpg`;

interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. "/services/rooms" — canonical is derived from SITE. */
  path?: string;
  image?: string;
  /** Any number of schema.org JSON-LD objects. */
  jsonLd?: Array<Record<string, unknown>>;
  noindex?: boolean;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"][data-seo]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute('data-seo', '');
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-seo]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('data-seo', '');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-page SEO: title, description, canonical, Open Graph, Twitter card and
 * JSON-LD structured data — all written into <head> and cleaned up on change.
 * Google executes the SPA and indexes these; combined with the rich static
 * defaults in index.html and /sitemap.xml this gives strong first-day SEO.
 */
export function Seo({ title, description, path = '', image = DEFAULT_OG, jsonLd = [], noindex }: SeoProps) {
  const fullTitle = title.includes('Kumbh Connect') ? title : `${title} · Kumbh Connect`;
  const url = `${SITE}${path}`;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Kumbh Connect');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);

    // JSON-LD blocks
    const scripts = jsonLd.map((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-seo-jsonld', '');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
      return s;
    });

    return () => {
      scripts.forEach((s) => s.remove());
    };
  }, [fullTitle, description, url, image, noindex, JSON.stringify(jsonLd)]);

  return null;
}

// ── Reusable schema.org builders ──
export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kumbh Connect',
    url: SITE,
    logo: `${SITE}/favicon.svg`,
    sameAs: [] as string[],
    description: 'Digital help and booking partner for the Nashik Trimbakeshwar Simhastha Kumbh Mela 2027.',
  };
}
export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'Kumbh Connect',
    url: SITE,
    areaServed: ['Nashik', 'Trimbakeshwar', 'Maharashtra, India'],
    knowsLanguage: ['en', 'hi', 'mr'],
    priceRange: '₹₹',
  };
}
export function eventSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Nashik Trimbakeshwar Simhastha Kumbh Mela 2027',
    startDate: '2027-07-01',
    endDate: '2027-09-30',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: 'Nashik and Trimbakeshwar', address: { '@type': 'PostalAddress', addressLocality: 'Nashik', addressRegion: 'Maharashtra', addressCountry: 'IN' } },
    organizer: { '@type': 'Organization', name: 'Kumbh Connect', url: SITE },
  };
}
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
  };
}
export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE}${c.path}` })),
  };
}
export function serviceSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'Organization', name: 'Kumbh Connect', url: SITE },
    areaServed: 'Nashik, Trimbakeshwar, India',
    url: `${SITE}${path}`,
  };
}
