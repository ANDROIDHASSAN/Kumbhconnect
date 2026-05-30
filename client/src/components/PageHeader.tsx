import Image from 'next/image';
import { IMAGES, type ImageKey } from '@/lib/images';

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: ImageKey;
  children?: React.ReactNode;
}) {
  if (image) {
    return (
      <section className="grain relative overflow-hidden bg-ink text-white">
        <Image src={IMAGES[image]} alt="" fill priority sizes="100vw" className="object-cover object-center opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40" />
        <div className="container-page relative py-16 sm:py-20">
          {eyebrow && <p className="eyebrow !text-gold">{eyebrow}</p>}
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-4 max-w-2xl text-lg text-cream/80">{subtitle}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-devotional">
      <div className="container-page py-14">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-muted">{subtitle}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
