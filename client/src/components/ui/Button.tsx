import * as React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-saffron text-white hover:bg-saffron-dark focus-visible:ring-saffron',
  secondary: 'bg-plum text-white hover:bg-plum-light focus-visible:ring-plum',
  outline: 'border border-line bg-white text-ink hover:bg-cream focus-visible:ring-plum',
  ghost: 'text-ink hover:bg-cream focus-visible:ring-plum',
  whatsapp: 'bg-whatsapp text-white hover:brightness-95 focus-visible:ring-whatsapp',
  danger: 'bg-rose text-white hover:brightness-95 focus-visible:ring-rose',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
};

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

// Polymorphic: render as <button>, <a>, or next-intl <Link>.
type ButtonProps<C extends React.ElementType> = ButtonOwnProps & {
  as?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps | 'as'>;

export function Button<C extends React.ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps<C>) {
  const Comp = (as || 'button') as React.ElementType;
  return <Comp className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
