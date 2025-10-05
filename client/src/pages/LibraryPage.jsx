import { useEffect, useState } from 'react';
import api from '../api/client.js';
import AgentCard from '../components/AgentCard.jsx';
import LoadingState from '../components/LoadingState.jsx';
import AdSlot from '../components/AdSlot.jsx';

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timeoutId;

    async function fetchAgents(searchTerm) {
      setLoading(true);
      try {
        const response = await api.get('/agent-files', {
          params: searchTerm ? { q: searchTerm } : { sort: 'recent' }
        });
        setAgents(response.data.agents);
      } catch (error) {
        console.error('Library load error', error);
      } finally {
        setLoading(false);
      }
    }

    timeoutId = setTimeout(() => {
      fetchAgents(query.trim());
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleCopy = async (agentId) => {
    try {
      const response = await api.get(`/agent-files/${agentId}`);
      const text = response.data.agentFile?.content ?? '';
      await navigator.clipboard.writeText(text);
      await api.post(`/agent-files/${agentId}/copies`);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Copy failed', error);
      setMessage('Failed to copy. Check permissions.');
    }
  };

  return (
    <main>
      <section className="glass-panel dos-section">
        <header>
          <h1 style={{ margin: 0 }}>Agent Library</h1>
          <p className="dos-notice" style={{ margin: '0.4rem 0' }}>
            Browse, search, and remix agent playbooks contributed by the community.
          </p>
        </header>
        <input
          type="search"
          placeholder="Search titles, tags, or descriptions..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {message && <span style={{ color: message.includes('fail') ? 'var(--danger)' : 'var(--success)' }}>{message}</span>}
      </section>

      {loading ? (
        <LoadingState label="Indexing agents" />
      ) : (
        <div className="card-grid">
          {agents.map((agent) => (
            <div key={agent._id} style={{ position: 'relative' }}>
              <AgentCard agent={agent} />
              <button
                className="dos-button"
                style={{ position: 'absolute', top: '1.4rem', right: '1.4rem', fontSize: '0.75rem', padding: '0.4rem 0.9rem' }}
                onClick={() => handleCopy(agent._id)}
                type="button"
              >
                Copy agent.md
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <AdSlot label="Sponsored Tools" />
      </div>
    </main>
  );
}
