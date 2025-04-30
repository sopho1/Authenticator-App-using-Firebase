import React, { useState } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, onSignOut }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Added state for menu

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isTransparent = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="App">
      <nav className={isTransparent ? 'transparent-nav' : ''}>
        <ul className="nav-links">
          {isAuthenticated ? (
            <>
              <button className="btn" onClick={onSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/SignUp" onClick={closeMenu}>
              
            </Link>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;