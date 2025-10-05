const STAR_COUNT = 5;

export default function RatingStars({ rating = 0, count = 0, onRate, compact = false }) {
  const stars = Array.from({ length: STAR_COUNT }, (_, index) => index + 1);
  const wrapperClass = `dos-rating${compact ? ' dos-rating--compact' : ''}`;

  return (
    <div className={wrapperClass}>
      <div className="dos-rating__stars">
        {stars.map((value) => {
          const filled = value <= Math.round(rating);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onRate?.(value)}
              disabled={!onRate}
              className={`dos-rating__button${filled ? ' is-filled' : ''}`}
              aria-label={`Rate ${value}`}
            >
              {filled ? '█' : '░'}
            </button>
          );
        })}
      </div>
      {!compact && (
        <span className="dos-notice" style={{ fontSize: '0.9rem' }}>
          {rating?.toFixed ? rating.toFixed(1) : rating} ({count})
        </span>
      )}
    </div>
  );
}
