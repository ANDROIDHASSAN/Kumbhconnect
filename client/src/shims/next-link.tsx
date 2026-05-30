import { forwardRef } from 'react';
import { Link as RRLink } from 'react-router-dom';

export default forwardRef<HTMLAnchorElement, any>(function NextLink({ href, ...rest }, ref) {
  const to = href ?? '#';
  if (/^(https?:|tel:|mailto:|upi:)/.test(to)) return <a ref={ref} href={to} {...rest} />;
  return <RRLink ref={ref} to={to} {...rest} />;
});
