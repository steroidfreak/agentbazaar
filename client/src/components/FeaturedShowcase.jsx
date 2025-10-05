import { Link } from 'react-router-dom';
import RatingStars from './RatingStars.jsx';

export default function FeaturedShowcase({ featured }) {
  const { agent, video } = featured ?? {};

  return (
    <section className="banner dos-section">
      <header className="dos-section" style={{ margin: 0 }}>
        <h2 style={{ margin: 0 }}>Weekly Highlights</h2>
        <p className="dos-notice" style={{ margin: 0 }}>
          Curated morsels for your autonomous agent experiments.
        </p>
      </header>
      <div className="featured-grid">
        <div className="terminal-panel featured-terminal">
          <div className="terminal-header">
            <span>AGENT.MD SPOTLIGHT</span>
          </div>
          <div className="terminal-body" style={{ display: 'grid', gap: '0.8rem' }}>
            {agent ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong>{agent.title}</strong>
                  <RatingStars rating={agent.ratingAverage} count={agent.ratingCount} compact />
                </div>
                <p className="dos-notice" style={{ margin: 0 }}>
                  {agent.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {agent.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link to={`/agent/${agent._id}`} className="dos-button" style={{ justifySelf: 'flex-start' }}>
                  Inspect agent.md
                </Link>
              </>
            ) : (
              <p className="dos-notice" style={{ margin: 0 }}>
                No agents uploaded yet — add one to unlock the spotlight.
              </p>
            )}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', display: 'grid', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Video Deep Dive</h3>
          {video ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', border: '2px solid var(--accent)' }}>
              <iframe
                src={video.embedUrl}
                title="YouTube video of the week"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : (
            <p className="dos-notice" style={{ margin: 0 }}>
              Add YouTube IDs to <code>YOUTUBE_VIDEO_IDS</code> to showcase tutorials.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
