import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LoadingState from '../components/LoadingState.jsx';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchDashboard() {
      try {
        const response = await api.get('/agent-files/dashboard/me');
        setData(response.data);
      } catch (error) {
        console.error('Dashboard load error', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading || !data) {
    return <LoadingState label="Crunching metrics" />;
  }

  const { summary, files } = data;

  return (
    <main>
      <section className="banner dos-section">
        <div>
          <h1 style={{ margin: 0 }}>Welcome back, @{user?.username}</h1>
          <p className="dos-notice" style={{ margin: '0.3rem 0' }}>
            Track how your agents perform across the bazaar.
          </p>
        </div>
        <div className="dos-metric-grid">
          <Metric label="Uploads" value={summary.totalFiles} />
          <Metric label="Total Views" value={summary.totalViews} />
          <Metric label="Copies" value={summary.totalCopies} />
          <Metric label="Avg Rating" value={summary.averageRating || ''} />
        </div>
      </section>

      <section className="glass-panel dos-section">
        <header>
          <h2 style={{ marginBottom: '0.3rem' }}>Your agents</h2>
          <p className="dos-notice" style={{ margin: 0 }}>Sorted by most recent uploads.</p>
        </header>
        <div className="card-grid">
          {files.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="glass-panel dos-metric">
      <span className="dos-metric__label">{label}</span>
      <strong className="dos-metric__value">{value}</strong>
    </div>
  );
}
