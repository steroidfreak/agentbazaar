import { useEffect, useState } from 'react';
import api from '../api/client.js';
import FeaturedShowcase from '../components/FeaturedShowcase.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LoadingState from '../components/LoadingState.jsx';

export default function FeaturedPage() {
  const [featured, setFeatured] = useState(null);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const [featuredRes, topRes] = await Promise.all([
          api.get('/featured'),
          api.get('/agent-files', { params: { sort: 'top', limit: 6 } })
        ]);
        setFeatured(featuredRes.data);
        setTopRated(topRes.data.agents);
      } catch (error) {
        console.error('Featured load error', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, []);

  if (loading) {
    return <LoadingState label="Picking highlights..." />;
  }

  return (
    <main>
      <FeaturedShowcase featured={featured} />
      <section style={{ display: 'grid', gap: '1.5rem' }}>
        <header>
          <h2 style={{ marginBottom: '0.3rem' }}>Hall of Fame</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Best-rated agent.md files of the week.</p>
        </header>
        <div className="card-grid">
          {topRated.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </section>
    </main>
  );
}