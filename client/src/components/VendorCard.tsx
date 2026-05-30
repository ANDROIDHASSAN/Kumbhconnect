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
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-soft">
      {vendor.image_url && (
        <img src={vendor.image_url} alt={vendor.name} loading="lazy" className="h-40 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-ink">{vendor.name}</h3>
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
      </div>
    </div>
  );
}
