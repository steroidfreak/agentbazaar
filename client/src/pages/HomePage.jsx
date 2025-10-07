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
      <section className="glass-panel dos-section hero-section">
        <header className="dos-section hero-header">
          <span className="tag">New here?</span>
          <h1>Why Choose AgentBazaar.net?</h1>
          <p className="dos-notice">
            AgentBazaar.net gives you a purpose-built home for every agents.md file, so the community can discover,
            collaborate on, and reuse the work you publish.
          </p>
        </header>
        <div className="hero-grid">
          <article className="hero-card">
            <h3>The Problem with Scattered Agent Files</h3>
            <p>
              Many users store their agents.md files in Notion, personal drives, or other apps, which makes it tough to track
              where each file lives or share them quickly with collaborators.
            </p>
          </article>
          <article className="hero-card">
            <h3>The AgentBazaar.net Solution</h3>
            <p>
              AgentBazaar.net brings every agent into a single, organized repository that is tailored to agents.md files—no more
              juggling disparate storage tools.
            </p>
          </article>
          <article className="hero-card">
            <h3>Key Benefits</h3>
            <ul>
              <li>
                <strong>Centralized Storage:</strong> Keep all your agents in one place and access them whenever inspiration
                strikes.
              </li>
              <li>
                <strong>Community Sharing:</strong> Publish and discover helpful agents from creators across the community.
              </li>
              <li>
                <strong>Built for Agents:</strong> Manage agents.md files with features crafted specifically for this workflow.
              </li>
            </ul>
          </article>
        </div>
      </section>
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
      <AdSlot label="728x90 Leaderboard">
        <a href="https://www.workflow.sg" target="_blank" rel="noopener noreferrer" aria-label="Need to automate your workflow?">
          <pre>
            {String.raw`
 __        __   _                          _                  
 \ \      / /__| | ___ ___  _ __ ___   ___| |_ _   _ _ __ ___ 
  \ \ /\ / / _ \ |/ __/ _ \| '_ \  _ \ / _ \ __| | | | '__/ _ \
   \ V  V /  __/ | (_| (_) | | | | | |  __/ |_| |_| | | |  __/
    \_/\_/ \___|_|\___\___/|_| |_| |_|\___|\__|\__,_|_|  \___|
`}
          </pre>
          <span className="ad-tagline">Need to automate your workflow?</span>
        </a>
      </AdSlot>
    </main>
  );
}
