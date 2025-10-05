import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const isRegister = mode === 'register';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const response = await api.post(endpoint, payload);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Authentication failed');
    }
  };

  return (
    <main>
      <section className="glass-panel dos-section" style={{ maxWidth: '460px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center' }}>
          <h1>{isRegister ? 'Join AgentBazaar' : 'Operator Login'}</h1>
          <p className="dos-notice" style={{ margin: 0 }}>
            {isRegister
              ? 'Create an account to upload and curate agent.md playbooks.'
              : 'Sign in to manage your agents and community feedback.'}
          </p>
        </header>
        <form onSubmit={handleSubmit} className="dos-section">
          {isRegister && (
            <label className="dos-section" style={{ gap: '0.4rem' }}>
              <span>Username</span>
              <input name="username" value={form.username} onChange={handleChange} required={isRegister} />
            </label>
          )}
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="dos-section" style={{ gap: '0.4rem' }}>
            <span>Password</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} minLength={6} required />
          </label>
          {error && <span style={{ color: 'var(--danger)' }}>{error}</span>}
          <button type="submit" className="dos-button">
            {isRegister ? 'Create account' : 'Login'}
          </button>
        </form>
        <button
          type="button"
          onClick={() => {
            setMode(isRegister ? 'login' : 'register');
            setError('');
          }}
          className="dos-link"
          style={{ border: '1px solid var(--accent)', alignSelf: 'center' }}
        >
          {isRegister ? 'Have an account? Login instead.' : 'Need an account? Register now.'}
        </button>
      </section>
    </main>
  );
}
