import React from 'react';
import Icon from './Icon';
import ThemePicker from './ThemePicker';
import { useLocation } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ isSidebarCollapsed, onToggleSidebar, onMenuClick }) => {

  const location = useLocation();

  // On phones/tablets the sidebar is a slide-out drawer owned by <Sidebar />;
  // on desktop the button keeps collapsing/expanding it as before.
  const handleMenuClick = () => {
    if (window.matchMedia('(max-width: 991px)').matches) {
      window.dispatchEvent(new Event('nf:toggle-nav'));
    } else {
      (onToggleSidebar || onMenuClick)?.();
    }
  };

  const getPageName = () => {
    const path = location.pathname;

    if (path === "/") return "Dashboard";
    if (path === "/user-manager") return "User Manager";
    if (path === "/affiliates") return "Affiliates";
    if (path === "/advertisers") return "Advertisers";

    return "";
  };

  return (
    <header className="of-header">

      <div className="of-topbar">

        <div className="of-topbar-left">

          <button
            type="button"
            className="of-collapse-btn"
            onClick={handleMenuClick}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name="menu" className="of-top-icon" />
          </button>

          <button type="button" className="of-shortcuts">
            <Icon name="spark" className="of-top-icon" />
            <span>Shortcuts</span>
          </button>

        </div>

        <div className="of-top-actions">

          <ThemePicker />

          <span>
            <Icon name="spark" className="of-top-icon" />
            What's new
          </span>

          <span>
            <Icon name="bell" className="of-top-icon" />
            Notifications (0)
          </span>

          {/* <span>
            <Icon name="globe" className="of-top-icon" />
            Lang
          </span> */}

        </div>

      </div>

      {/* Dynamic Breadcrumb */}

      <div className="of-breadcrumb">

        <span>Home</span>

        <Icon name="arrowRight" className="of-breadcrumb-icon" />

        <span>{getPageName()}</span>

      </div>

    </header>
  );
};

export default Header;