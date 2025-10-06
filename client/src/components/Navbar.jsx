import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DesignSelector from './DesignSelector.jsx';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 720) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current);
  };

  const navLinkClass = ({ isActive }) => `dos-link${isActive ? ' dos-link--active' : ''}`;
  const navButtonClass = ({ isActive }) => `dos-button${isActive ? ' dos-link--active' : ''}`;

  return (
    <header className="glass-panel dos-navbar">
      <div className="dos-navbar__brand">
        <Link to="/" className="dos-brand">
          <span>AgentBazaar</span>
          <span className="dos-badge">v1</span>
        </Link>
        <button
          type="button"
          className="dos-navbar__toggle"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          Menu
        </button>
      </div>

      <nav id="primary-navigation" className={`dos-nav${isMenuOpen ? ' is-open' : ''}`}>
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
