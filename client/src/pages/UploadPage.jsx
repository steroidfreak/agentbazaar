import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function UploadPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [preview, setPreview] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
      setPreview('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setStatus('Please attach an agent.md file.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('tags', form.tags);
      formData.append('file', file);

      const response = await api.post('/agent-files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('Upload successful. Redirecting...');
      setTimeout(() => navigate(`/agent/${response.data._id}`), 1200);
    } catch (error) {
      console.error('Upload failed', error);
      setStatus(error.response?.data?.message ?? 'Upload failed.');
    }
  };

  return (
    <main>
      <section className="glass-panel" style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
        <header>
          <h1 style={{ margin: 0 }}>Upload agent.md</h1>
          <p style={{ margin: '0.4rem 0', color: 'var(--text-secondary)' }}>
            Share your orchestrations and empower the community. Markdown only.
          </p>
        </header>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
          <label style={{ display: 'grid', gap: '0.6rem' }}>
            <span>Title</span>
            <input name="title" value={form.title} onChange={handleChange} required maxLength={120} />
          </label>
          <label style={{ display: 'grid', gap: '0.6rem' }}>
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} maxLength={400} rows={3} />
          </label>
          <label style={{ display: 'grid', gap: '0.6rem' }}>
            <span>Tags (comma separated)</span>
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="search, retrieval, langchain" />
          </label>
          <label style={{ display: 'grid', gap: '0.6rem' }}>
            <span>agent.md file</span>
            <input type="file" accept=".md,text/markdown" onChange={handleFile} required />
          </label>
          <button type="submit" className="neon-button" style={{ justifySelf: 'flex-start' }}>
            Upload to Bazaar
          </button>
          {status && <span style={{ color: status.includes('fail') ? 'var(--danger)' : 'var(--success)' }}>{status}</span>}
        </form>
      </section>

      {preview && (
        <section className="terminal-panel" style={{ marginTop: '2rem' }}>
          <div className="terminal-header">
            <span className="terminal-light" style={{ background: '#00ffd5' }} />
            <span style={{ marginLeft: '0.6rem' }}>Preview</span>
          </div>
          <pre className="terminal-body" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
            {preview}
          </pre>
        </section>
      )}
    </main>
  );
}