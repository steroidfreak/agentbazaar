import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client.js';
import LoadingState from '../components/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EditAgentPage() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [form, setForm] = useState({ description: '', tags: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchAgent() {
      try {
        const response = await api.get(`/agent-files/${id}`);
        const currentAgent = response.data.agentFile;
        const ownerId = currentAgent.owner?._id ?? currentAgent.owner?.id;
        const viewerId = user?._id ?? user?.id;
        const canManage = Boolean(user && (user?.role === 'admin' || (ownerId && viewerId && ownerId === viewerId)));
        if (!canManage) {
          setStatus('You do not have permission to edit this agent.');
          setTimeout(() => navigate(`/agent/${id}`), 1500);
          return;
        }
        setAgent(currentAgent);
        setForm({
          description: currentAgent.description ?? '',
          tags: currentAgent.tags?.join(', ') ?? ''
        });
        setPreview(currentAgent.content.slice(0, 800));
      } catch (error) {
        console.error('Failed to load agent', error);
        setStatus(error.response?.data?.message ?? 'Failed to load agent data.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [id, isAuthenticated, navigate, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingState label="Preparing editor" />;
  }

  if (!agent) {
    return (
      <main>
        <section className="glass-panel dos-section">
          <h1>Agent not available</h1>
          <p className="dos-notice">{status || 'This agent could not be loaded.'}</p>
        </section>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = async (event) => {
    const selected = event.target.files?.[0];
    setFile(selected ?? null);
    if (selected) {
      const text = await selected.text();
      setPreview(text.slice(0, 800));
    } else {
      setPreview(agent.content.slice(0, 800));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('description', form.description);
      formData.append('tags', form.tags);
      if (file) {
        formData.append('file', file);
      }

      await api.patch(`/agent-files/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('Agent updated. Redirecting...');
      setTimeout(() => navigate(`/agent/${id}`), 1200);
    } catch (error) {
      console.error('Update failed', error);
      setStatus(error.response?.data?.message ?? 'Update failed.');
    }
  };

  const statusIsError = /fail|error|denied|permission|unauthorized/i.test(status);

  return (
    <main>
      <section className="glass-panel dos-section">
        <header>
          <h1 style={{ margin: 0 }}>Edit agent.md</h1>
          <p className="dos-notice" style={{ margin: '0.4rem 0' }}>
            Update description, tags, or replace the uploaded file.
          </p>
        </header>
        <form onSubmit={handleSubmit} className="dos-section">
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Current filename</span>
            <input value={agent.originalFilename || agent.title} readOnly />
          </label>
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Replace file (optional)</span>
            <input type="file" accept=".md,text/markdown" onChange={handleFile} />
            <span className="dos-notice">Leave empty to keep the existing file.</span>
          </label>
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={400}
              rows={3}
            />
          </label>
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Tags (comma separated)</span>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="search, retrieval, langchain"
            />
          </label>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button type="submit" className="dos-button">
              Save changes
            </button>
            <button type="button" className="dos-button" onClick={() => navigate(`/agent/${id}`)}>
              Cancel
            </button>
          </div>
          {status && (
            <span style={{ color: statusIsError ? 'var(--danger)' : 'var(--success)' }}>{status}</span>
          )}
        </form>
      </section>

      {preview && (
        <section className="terminal-panel" style={{ marginTop: '2rem' }}>
          <div className="terminal-header">
            <span>PREVIEW</span>
          </div>
          <pre className="terminal-body" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            {preview}
          </pre>
        </section>
      )}
    </main>
  );
}
