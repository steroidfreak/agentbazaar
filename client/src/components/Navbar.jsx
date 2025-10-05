import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DesignSelector from './DesignSelector.jsx';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => `dos-link${isActive ? ' dos-link--active' : ''}`;
  const navButtonClass = ({ isActive }) => `dos-button${isActive ? ' dos-link--active' : ''}`;

  return (
    <header className="glass-panel dos-navbar">
      <Link to="/" className="dos-brand">
        <span>AgentBazaar</span>
        <span className="dos-badge">v1</span>
      </Link>

      <nav className="dos-nav">
        <div className="dos-nav__group">
          <NavLink to="/library" className={navLinkClass}>
            Library
          </NavLink>
          <NavLink to="/featured" className={navLinkClass}>
            Highlights
          </NavLink>
        </div>
        <div className="dos-nav__group dos-nav__group--actions">
          {isAuthenticated ? (
            <>
              <NavLink to="/upload" className={navButtonClass}>
                Upload
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                @{user?.username ?? 'user'}
              </NavLink>
              <button type="button" onClick={handleLogout} className="dos-button dos-button--danger">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navButtonClass}>
              Login / Join
            </NavLink>
          )}
          <DesignSelector />
        </div>
      </nav>
    </header>
  );
}