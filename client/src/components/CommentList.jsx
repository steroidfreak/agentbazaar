import RatingStars from './RatingStars.jsx';

export default function CommentList({ reviews = [] }) {
  if (!reviews.length) {
    return <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No feedback yet. Be the first to leave a review.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
      {reviews.map((review) => (
        <div key={review._id} className="glass-panel" style={{ padding: '1rem 1.2rem', display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>{review.user?.username ?? 'Anonymous'}</span>
            <RatingStars rating={review.rating} compact />
          </div>
          {review.comment && <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{review.comment}</p>}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {new Date(review.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}