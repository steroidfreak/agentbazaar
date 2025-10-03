import { Link } from 'react-router-dom';
import RatingStars from './RatingStars.jsx';

export default function FeaturedShowcase({ featured }) {
  const { agent, video } = featured ?? {};

  return (
    <section className="banner" style={{ marginBottom: '2rem' }}>
      <header>
        <h2 style={{ margin: 0, fontSize: '1.6rem' }}>Weekly Highlights</h2>
        <p style={{ margin: '0.3rem 0', color: 'var(--text-secondary)' }}>
          Curated nuggets for your autonomous agent experiments.
        </p>
      </header>
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        <div className="terminal-panel">
          <div className="terminal-header">
            <span className="terminal-light" style={{ background: '#ff5f56' }} />
            <span className="terminal-light" style={{ background: '#ffbd2f' }} />
            <span className="terminal-light" style={{ background: '#27c93f' }} />
            <span style={{ marginLeft: '1rem', fontSize: '0.85rem', letterSpacing: '0.08em' }}>agent.md spotlight</span>
          </div>
          <div className="terminal-body">
            {agent ? (
              <div style={{ display: 'grid', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong>{agent.title}</strong>
                  <RatingStars rating={agent.ratingAverage} count={agent.ratingCount} compact />
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{agent.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {agent.tags?.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
                <Link to={`/agent/${agent._id}`} className="neon-button" style={{ justifySelf: 'flex-start' }}>
                  Inspect agent.md
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No agents uploaded yet — upload one to be featured!</p>
            )}
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1rem', minHeight: '240px' }}>
          <h3 style={{ marginTop: 0 }}>YouTube Deep Dive</h3>
          {video ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '14px', overflow: 'hidden' }}>
              <iframe
                src={video.embedUrl}
                title="YouTube video of the week"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              Add a list of YouTube video IDs in `YOUTUBE_VIDEO_IDS` to spotlight a weekly tutorial.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}