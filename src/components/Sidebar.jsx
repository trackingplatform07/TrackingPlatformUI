import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import '../css/Sidebar.css';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', permission: 'Dashboard' },
  { 
    label: 'Affiliates', 
    icon: 'users', 
    permission: 'Affiliates',
    children: [
      { label: 'Affiliates', path: '/affiliates' },
      { label: 'Pending Affiliates', path: '/affiliates/pending' },
      { label: 'Affiliate Postback', path: '/affiliates/postback' },
      { label: 'Affiliate Billing', path: '/affiliates/billing' },
      { label: 'Affiliate Referral', path: '/affiliates/referral' },
      { label: 'Postback Test', path: '/affiliates/postback-test' }
    ]
  },
  {
    label: 'Advertisers',
    icon: 'user',
    permission: 'Advertisers',
    children: [
      { label: 'Advertisers', path: '/advertisers' },
      { label: 'Advertisers Billing', path: '/advertisers-billing' }
    ]
  }
];

const Sidebar = ({ isCollapsed }) => {

  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const location = useLocation();

  useEffect(() => {

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);

      const permissions = storedUser.permissions || [];

      const allowedMenu = navItems.filter(item =>
        permissions.map(p => p.toLowerCase())
          .includes(item.permission.toLowerCase())
      );

      setMenu(allowedMenu);
    }

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Toggle function - click par open/close, bilkul Advertisers jaisa
  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <aside className={`of-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>

      <div className="of-logo-row">
        <p>Company</p>
      </div>

      {!isCollapsed && <p className="of-nav-title">Navigation</p>}

      <nav>
        <ul className="of-nav-list">

          {menu.map((item) => (
            <li key={item.label}>

              {/* If item has children (Dropdown) */}
              {item.children ? (
                <>
                  <div
                    className="of-nav-btn"
                    onClick={() => toggleMenu(item.label)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="of-nav-item-main">
                      <Icon name={item.icon} className="of-nav-icon" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </span>

                    {!isCollapsed && (
                      <Icon
                        name="arrowRight"
                        className={`of-arrow-icon ${openMenu === item.label ? 'rotate' : ''}`}
                      />
                    )}
                  </div>

                  {/* Submenu - sirf tab dikhega jab openMenu match kare */}
                  {openMenu === item.label && (
                    <ul className="of-submenu">
                      {item.children.map((sub) => (
                        <li key={sub.label}>
                          <Link
                            to={sub.path}
                            className={`of-submenu-item ${
                              location.pathname === sub.path ? 'active' : ''
                            }`}
                          >
                            {!isCollapsed && <span>{sub.label}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                /* Normal menu item */
                <Link to={item.path} className="of-nav-btn">
                  <span className="of-nav-item-main">
                    <Icon name={item.icon} className="of-nav-icon" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </span>

                  {!isCollapsed && (
                    <Icon name="arrowRight" className="of-arrow-icon" />
                  )}
                </Link>
              )}

            </li>
          ))}

        </ul>
      </nav>

      {/* User Manager */}
      {user?.permissions?.includes("UserManagement") && (
        <div className="of-sidebar-bottom">
          <Link to="/user-manager" className="of-nav-btn of-secondary-row">
            <span className="of-nav-item-main">
              <Icon name="users" className="of-nav-icon" />
              {!isCollapsed && <span>User Manager</span>}
            </span>
            {!isCollapsed && (
              <Icon name="arrowRight" className="of-arrow-icon" />
            )}
          </Link>
        </div>
      )}

      {/* Footer */}
      <div className="of-sidebar-foot">

        <div className="of-avatar">
          {user ? user.firstName.charAt(0) : "U"}
        </div>

        {!isCollapsed && user && (
          <div>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <p>{user.role}</p>
          </div>
        )}

        {!isCollapsed && (
          <Link
            to="/login"
            className="of-exit-link"
            onClick={handleLogout}
          >
            Logout
          </Link>
        )}

      </div>

    </aside>
  );
};

export default Sidebar;