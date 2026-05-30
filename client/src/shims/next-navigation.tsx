import { useLocation, useNavigate, useSearchParams as rrUseSearchParams } from 'react-router-dom';

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
    forward: () => navigate(1),
  };
}
export function useSearchParams() {
  const [sp] = rrUseSearchParams();
  return sp;
}
export function notFound(): never {
  throw new Error('NEXT_NOT_FOUND');
}
export function redirect(href: string) {
  window.location.href = href;
}
