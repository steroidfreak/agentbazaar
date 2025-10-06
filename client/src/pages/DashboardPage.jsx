import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import AgentCard from '../components/AgentCard.jsx';
import LoadingState from '../components/LoadingState.jsx';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/agent-files/dashboard/me');
      setData(response.data);
      setStatus('');
    } catch (error) {
      console.error('Dashboard load error', error);
      setStatus(error.response?.data?.message ?? 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchDashboard();
  }, [fetchDashboard, isAuthenticated]);

  const handleEdit = (agentId) => {
    navigate(`/agent/${agentId}/edit`);
  };

  const handleDelete = async (agentId) => {
    const confirmed = window.confirm('Delete this agent file permanently?');
    if (!confirmed) {
      return;
    }
    try {
      await api.delete(`/agent-files/${agentId}`);
      setStatus('Agent deleted.');
      await fetchDashboard();
    } catch (error) {
      console.error('Delete agent error', error);
      setStatus(error.response?.data?.message ?? 'Failed to delete agent.');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading || !data) {
    return <LoadingState label="Crunching metrics" />;
  }

  const { summary, files } = data;
  const statusIsError = /fail|error|denied|permission|unauthorized/i.test(status);

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
        {status && (
          <p className="dos-notice" style={{ color: statusIsError ? 'var(--danger)' : 'var(--success)' }}>
            {status}
          </p>
        )}
        <div className="card-grid">
          {files.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              actions={
                <>
                  <button
                    type="button"
                    className="dos-button"
                    onClick={() => handleEdit(agent._id)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="dos-button"
                    onClick={() => handleDelete(agent._id)}
                    style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Delete
                  </button>
                </>
              }
            />
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
