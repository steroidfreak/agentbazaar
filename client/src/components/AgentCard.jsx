import { Link } from 'react-router-dom';
import RatingStars from './RatingStars.jsx';

export default function AgentCard({ agent }) {
  return (
    <article className="glass-panel" style={{ padding: '1.4rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
        <div>
          <Link to={`/agent/${agent._id}`} style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {agent.title}
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <span>@{agent.owner?.username}</span>
            <span>•</span>
            <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <RatingStars rating={agent.ratingAverage} count={agent.ratingCount} compact />
      </div>
      {agent.description && <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{agent.description}</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {agent.tags?.length
          ? agent.tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))
          : <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No tags</span>}
      </div>
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span>?? {agent.views}</span>
          <span>?? {agent.copyCount}</span>
        </div>
        <Link to={`/agent/${agent._id}`} className="neon-button" style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}>
          View Details
        </Link>
      </footer>
    </article>
  );
}