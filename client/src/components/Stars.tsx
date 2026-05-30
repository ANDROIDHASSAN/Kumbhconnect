export function Stars({ rating = 5 }: { rating?: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5 text-gold" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden>
          {i < full ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
