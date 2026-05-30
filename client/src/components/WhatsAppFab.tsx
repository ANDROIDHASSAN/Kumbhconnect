'use client';
import { useTranslations } from 'next-intl';
import { waLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/WhatsAppButton';

export function WhatsAppFab() {
  const t = useTranslations('common');
  const message = 'Namaste! I have a question about Kumbh Connect (Nashik Kumbh 2027).';
  return (
    <a
      href={waLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('chatOnWhatsapp')}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lift transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2"
    >
      <span className="scale-125"><WhatsAppIcon /></span>
    </a>
  );
}
