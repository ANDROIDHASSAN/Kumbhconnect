import type { Vendor } from './types';
import { INDICATIVE_FROM } from './services';

/** Cheapest available price for a vendor, used to render "from ₹X". */
export function vendorFromPrice(vendor: Vendor): number {
  const rates = vendor.rates_json ? Object.values(vendor.rates_json) : [];
  if (rates.length) return Math.min(...rates);
  return INDICATIVE_FROM[vendor.type] ?? 0;
}
