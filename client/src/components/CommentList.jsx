import RatingStars from './RatingStars.jsx';

export default function CommentList({ reviews = [] }) {
  if (!reviews.length) {
    return <p className="dos-notice" style={{ marginTop: '1rem' }}>No feedback yet. Be the first to leave a review.</p>;
  }

  return (
    <div className="dos-table" style={{ marginTop: '1rem' }}>
      {reviews.map((review) => (
        <div key={review._id} className="glass-panel dos-comment">
          <div className="dos-comment__meta">
            <span style={{ fontWeight: 600 }}>{review.user?.username ?? 'Anonymous'}</span>
            <RatingStars rating={review.rating} compact />
          </div>
          {review.comment && <p className="dos-notice" style={{ margin: 0 }}>{review.comment}</p>}
          <span className="dos-comment__timestamp">{new Date(review.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
