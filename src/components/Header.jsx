import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import BrandLogo from './BrandLogo';
import { navItems, findPage } from './navItems';
import '../css/Header.css';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

const Header = ({ isSidebarCollapsed, onToggleSidebar, onMenuClick }) => {

  const location = useLocation();
  const [user] = useState(readUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  // On phones/tablets the sidebar is a slide-out drawer owned by <Sidebar />;
  // on desktop the button keeps collapsing/expanding it as before.
  const handleMenuClick = () => {
    if (window.matchMedia('(max-width: 991px)').matches) {
      window.dispatchEvent(new Event('nf:toggle-nav'));
    } else {
      (onToggleSidebar || onMenuClick)?.();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // name of the open page (e.g. "Pending Affiliates") with its section's icon
  const section = findPage(navItems, location.pathname);

  const displayName = user?.firstName || user?.role || 'User';

  return (
    <header className="of-header nf-topbar">

      <div className="nf-topbar-left">
        <button
          type="button"
          className="of-collapse-btn nf-top-btn"
          onClick={handleMenuClick}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="menu" className="of-top-icon" />
        </button>

        <Link to="/dashboard" className="nf-topbar-brand">
          <BrandLogo />
        </Link>

        {section && (
          <span className="nf-section-chip">
            <Icon name={section.icon} className="of-top-icon" />
            {section.label}
          </span>
        )}
      </div>

      <div className="of-top-actions nf-topbar-right">
        <button type="button" className="of-shortcuts nf-top-link">
          <Icon name="spark" className="of-top-icon" />
          <span>Shortcuts</span>
        </button>

        <Link to="/billing" className="nf-top-link">
          <Icon name="wallet" className="of-top-icon" />
          <span>Billing</span>
        </Link>

        <Link to="/support/call" className="nf-top-link">
          <Icon name="support" className="of-top-icon" />
          <span>Support</span>
        </Link>


        <button type="button" className="nf-top-btn nf-bell" aria-label="Notifications (0)" title="Notifications (0)">
          <Icon name="bell" className="of-top-icon" />
        </button>

        <div className="nf-user" ref={userRef}>
          <button type="button" className="nf-user-trigger" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
            <span className="nf-user-avatar">{displayName.charAt(0).toUpperCase()}</span>
            <span className="nf-user-name">{displayName}</span>
            <Icon name="arrowRight" className="nf-user-caret" />
          </button>
          {menuOpen && (
            <div className="nf-user-menu" role="menu">
              {user && (
                <div className="nf-user-head">
                  <strong>{user.firstName} {user.lastName}</strong>
                  <span>{user.role}</span>
                </div>
              )}
              <Link to="/account/profile" role="menuitem">Profile</Link>
              <Link to="/account/settings" role="menuitem">Settings</Link>
              {/* opens the Notifications tab of the Settings page */}
              <Link to="/account/settings" state={{ tab: 'Notifications' }} role="menuitem">Notifications</Link>
              <Link to="/account/change-logs" role="menuitem">Change logs</Link>
              <Link to="/account/access-logs" role="menuitem">Access logs</Link>
              <Link to="/account/referral" role="menuitem">Referral</Link>
              <Link to="/login" role="menuitem" className="is-danger" onClick={handleLogout}>Logout</Link>
            </div>
          )}
        </div>
      </div>

    </header>
  );
};

export default Header;
