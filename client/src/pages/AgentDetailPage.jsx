import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import CommentList from '../components/CommentList.jsx';
import RatingStars from '../components/RatingStars.jsx';
import LoadingState from '../components/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AgentDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [agent, setAgent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    async function initialize() {
      try {
        const response = await api.get(`/agent-files/${id}`);
        setAgent(response.data.agentFile);
        setReviews(response.data.reviews);
        await api.post(`/agent-files/${id}/views`);
      } catch (error) {
        console.error('Agent load error', error);
      }
    }
    initialize();
  }, [id]);

  const copyToClipboard = async () => {
    try {
      if (!agent) return;
      await navigator.clipboard.writeText(agent.content);
      await api.post(`/agent-files/${id}/copies`);
      setStatus('Copied agent.md to clipboard!');
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('Copy failed.');
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!userRating) {
      setStatus('Pick a rating first.');
      return;
    }

    try {
      const payload = { agentId: id, rating: userRating, comment };
      const response = await api.post('/reviews', payload);
      const newReview = response.data.review;
      setStatus('Feedback saved!');
      setComment('');
      setReviews((current) => {
        const existingIndex = current.findIndex((review) => review._id === newReview._id);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = newReview;
          return next;
        }
        return [newReview, ...current];
      });
      setAgent((prev) =>
        prev
          ? {
            ...prev,
            ratingAverage: response.data.rating.ratingAverage,
            ratingCount: response.data.rating.ratingCount
          }
          : prev
      );
    } catch (error) {
      setStatus(error.response?.data?.message ?? 'Failed to submit feedback.');
    }
  };

  if (!agent) {
    return <LoadingState label="Retrieving agent dossier" />;
  }

  return (
    <main>
      <section className="glass-panel dos-section">
        <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: '0.5rem' }}>{agent.title}</h1>
            <div className="dos-notice" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span>By @{agent.owner?.username ?? 'unknown'}</span>
              <span>{new Date(agent.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <button type="button" onClick={copyToClipboard} className="dos-button">
            Copy
          </button>
        </header>
        <RatingStars rating={agent.ratingAverage} count={agent.ratingCount} />
        <div className="terminal-panel">
          <div className="terminal-header">
            <span>AGENT.MD</span>
          </div>
          <pre className="terminal-body" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', maxHeight: '520px', overflowY: 'auto' }}>
            {agent.content}
          </pre>
        </div>
        {status && (
          <span style={{ color: status.includes('fail') ? 'var(--danger)' : 'var(--success)' }}>{status}</span>
        )}
      </section>

      <section className="dos-section">
        <h2>Community feedback</h2>
        {isAuthenticated ? (
          <form onSubmit={submitReview} className="glass-panel dos-section" style={{ marginBottom: '1.5rem' }}>
            <div>
              <span style={{ display: 'block', marginBottom: '0.4rem' }}>Your rating</span>
              <RatingStars rating={userRating} onRate={setUserRating} />
            </div>
            <textarea
              placeholder="Share build tips, gotchas, or customization ideas..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
            />
            <button type="submit" className="dos-button" style={{ justifySelf: 'flex-start' }}>
              Submit feedback
            </button>
          </form>
        ) : (
          <p className="dos-notice">Login to rate and discuss this agent.</p>
        )}

        <CommentList reviews={reviews} />
      </section>
    </main>
  );
}
