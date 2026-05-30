// ─────────────────────────────────────────────────────────────
// Curated, verified imagery (Unsplash). Each URL was checked to be a
// real, on-theme photograph. We pass explicit width/quality so next/image
// serves crisp, light files. Keep this list small and intentional.
// ─────────────────────────────────────────────────────────────

const U = (id: string, w = 1600, q = 70) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const IMAGES = {
  // South-Indian temple gopuram under a starry dusk sky — the hero.
  templeDusk: U('1582510003544-4d00b7f74220'),
  // Hawa Mahal, warm-lit at blue hour — heritage / craft.
  palaceDusk: U('1545126178-862cdb469409'),
  // Amer Fort rising over still water with ghat-like steps — guide.
  fortWater: U('1599661046289-e31897846e41'),
  // Himalayan river through pines — nature / routes / calm.
  river: U('1609920658906-8223bd289001'),
};

export type ImageKey = keyof typeof IMAGES;

export function img(key: ImageKey, w?: number, q?: number) {
  // Re-derive at a specific width when needed (e.g. cards vs hero).
  const base = IMAGES[key].split('?')[0];
  const id = base.split('photo-')[1];
  return U(id, w, q);
}
