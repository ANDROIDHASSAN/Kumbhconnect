import { Link } from '@/i18n/routing';
import { Badge } from '@/components/ui/Badge';
import { Stars } from '@/components/Stars';
import type { Vendor } from '@/lib/types';
import { vendorFromPrice } from '@/lib/data';

export function VendorCard({
  vendor,
  fromLabel,
  verifiedLabel,
}: {
  vendor: Vendor;
  fromLabel: string;
  verifiedLabel: string;
}) {
  const price = vendorFromPrice(vendor);
  return (
    <Link
      href={`/vendor/${vendor.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-saffron/50 hover:shadow-lift"
    >
      {vendor.image_url && (
        <div className="h-40 w-full overflow-hidden">
          <img src={vendor.image_url} alt={vendor.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink group-hover:text-saffron-dark">{vendor.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{vendor.area}</p>
          </div>
          {vendor.kyc_status === 'verified' && <Badge tone="green">✓ {verifiedLabel}</Badge>}
        </div>
        <div className="mt-3 flex items-center justify-between">
          {vendor.rating != null && <Stars rating={vendor.rating} />}
          {price > 0 && (
            <p className="text-sm text-muted">
              {fromLabel} <span className="text-base font-bold text-ink">₹{price.toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-saffron-dark opacity-0 transition-opacity group-hover:opacity-100">
          View details &amp; book <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}
