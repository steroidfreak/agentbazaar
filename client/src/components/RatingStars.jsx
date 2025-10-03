const STAR_COUNT = 5;

export default function RatingStars({ rating = 0, count = 0, onRate, compact = false }) {
  const stars = Array.from({ length: STAR_COUNT }, (_, index) => index + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {stars.map((value) => {
          const filled = value <= Math.round(rating);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onRate?.(value)}
              disabled={!onRate}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: onRate ? 'pointer' : 'default',
                color: filled ? 'var(--accent)' : 'rgba(255, 255, 255, 0.25)',
                fontSize: compact ? '1rem' : '1.2rem'
              }}
            >
              ?
            </button>
          );
        })}
      </div>
      {!compact && (
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {rating?.toFixed ? rating.toFixed(1) : rating} ({count})
        </span>
      )}
    </div>
  );
}