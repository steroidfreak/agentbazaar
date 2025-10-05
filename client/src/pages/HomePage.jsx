import { useEffect, useState } from 'react';
import api from '../api/client.js';
import FeaturedShowcase from '../components/FeaturedShowcase.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import AdSlot from '../components/AdSlot.jsx';

export default function HomePage() {
  const [featured, setFeatured] = useState(null);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, popularRes] = await Promise.all([
          api.get('/featured'),
          api.get('/agent-files', { params: { sort: 'popular', limit: 4 } })
        ]);
        setFeatured(featuredRes.data);
        setPopular(popularRes.data.agents);
      } catch (error) {
        console.error('Home load error', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <LoadingState label="Spinning up the bazaar" />;
  }

  return (
    <main>
      <FeaturedShowcase featured={featured} />
      <section className="glass-panel dos-section">
        <header>
          <h2 style={{ marginBottom: '0.3rem' }}>Popular this week</h2>
          <p className="dos-notice" style={{ margin: 0 }}>
            Top-downloaded agent.md files from the community.
          </p>
        </header>
        <div className="card-grid">
          {popular.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </section>
      <AdSlot label="728x90 Leaderboard" />
    </main>
  );
}
