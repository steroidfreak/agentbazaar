import { Link } from 'react-router-dom';
import RatingStars from './RatingStars.jsx';

export default function AgentCard({ agent }) {
  return (
    <article className="glass-panel agent-card">
      <div className="agent-card__header">
        <div>
          <Link to={`/agent/${agent._id}`} style={{ fontSize: '1.2rem' }}>
            {agent.title}
          </Link>
          <div className="agent-card__meta">
            <span>@{agent.owner?.username ?? 'unknown'}</span>
            <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <RatingStars rating={agent.ratingAverage} count={agent.ratingCount} compact />
      </div>

      {agent.description && <p className="dos-notice">{agent.description}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {agent.tags?.length ? (
          agent.tags.map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))
        ) : (
          <span className="dos-notice" style={{ fontSize: '0.85rem' }}>
            No tags listed
          </span>
        )}
      </div>

      <footer className="agent-card__footer">
        <div className="agent-card__stats">
          <span>Views: {agent.views ?? 0}</span>
          <span>Copies: {agent.copyCount ?? 0}</span>
        </div>
        <Link to={`/agent/${agent._id}`} className="dos-button" style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem' }}>
          View Details
        </Link>
      </footer>
    </article>
  );
}
