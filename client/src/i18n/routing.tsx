import { forwardRef } from 'react';
import { Link as RRLink, useLocation, useNavigate } from 'react-router-dom';

export { locales, localeNames } from './index';
export type { Locale } from './index';

// next-intl's <Link href> → react-router <Link to>. External links (wa.me,
// tel:, http) still render plain anchors so behaviour matches.
export const Link = forwardRef<HTMLAnchorElement, any>(function Link({ href, ...rest }, ref) {
  const to = href ?? '#';
  if (/^(https?:|tel:|mailto:|wa\.me|upi:)/.test(to) || to.startsWith('http')) {
    return <a ref={ref} href={to} {...rest} />;
  }
  return <RRLink ref={ref} to={to} {...rest} />;
});

export function usePathname() {
  return useLocation().pathname;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    refresh: () => {},
    back: () => navigate(-1),
  };
}
