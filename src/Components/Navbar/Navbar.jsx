import React, { useMemo, useState } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onSignOut, userRole }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const navLinks = useMemo(
    () => [
      { to: '/home', label: 'Overview', requiresAuth: true },
      { to: '/home#capabilities', label: 'Highlights', requiresAuth: true },
      { to: '/home#insights', label: 'Insights', requiresAuth: true },
      { to: '/admin', label: 'Admin', requiresAuth: true, adminOnly: true },
    ],
    []
  );

  const filteredLinks = navLinks.filter((link) => {
    if (!link.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (link.adminOnly) return userRole === 'admin';
    return true;
  });

  const closeMenu = () => setIsMenuOpen(false);

  const isActiveLink = (target) => {
    if (!target.includes('#')) {
      return location.pathname === target;
    }
    const [path, hash] = target.split('#');
    return location.pathname === path && location.hash === `#${hash}`;
  };

  const shouldShowToggle = (!isAuthPage && !isAuthenticated) || filteredLinks.length > 0;

  const navLinksClass = [
    'nav-links',
    isMenuOpen ? 'open' : '',
    filteredLinks.length === 0 ? 'no-nav-links' : '',
    isAuthPage ? 'auth-screen' : '',
  ]
    .join(' ')
    .trim();

  return (
    <header className={`navbar ${isAuthPage ? 'transparent-nav' : ''}`}>
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        AuthFlow
      </Link>

      {shouldShowToggle && (
        <button
          className="nav-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      )}

      <div className={navLinksClass}>
        {filteredLinks.length > 0 && (
          <ul>
            {filteredLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} onClick={closeMenu} className={isActiveLink(link.to) ? 'active' : ''}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!isAuthPage && (
          <div className="nav-actions">
            {isAuthenticated ? (
              <button className="btn btn-signout" onClick={onSignOut}>
                Sign Out
              </button>
            ) : (
              <>
                <Link to="/login" className="btn ghost" onClick={closeMenu}>
                  Sign In
                </Link>
                <Link to="/signup" className="btn" onClick={closeMenu}>
                  Create Account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;