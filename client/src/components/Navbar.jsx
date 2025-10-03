import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass-panel" style={{ margin: '1rem auto', width: 'min(100%, var(--max-width))' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent)' }}>AgentBazaar</span>
          <span className="tag">v1</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <NavLink to="/library" className="neon-button" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
            Library
          </NavLink>
          <NavLink to="/featured" className="neon-button" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
            Highlights
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/upload" className="neon-button" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
                Upload
              </NavLink>
              <NavLink to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {user?.username}
              </NavLink>
              <button onClick={handleLogout} className="neon-button" style={{ background: 'rgba(255, 85, 119, 0.12)', borderColor: 'rgba(255, 85, 119, 0.45)', fontSize: '0.85rem' }}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="neon-button" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}>
              Login / Join
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}