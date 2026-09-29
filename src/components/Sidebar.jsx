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
  },
  {
    label: 'Offers',
    icon: 'gift',
    permission: 'Offers',
    children: [
      { label: 'Create Offer', path: '/offers/create' },
      { label: 'Offers - Live (Today)', path: '/offers/live' },
      { label: 'Offers - Approved', path: '/offers/approved' },
      { label: 'Smart Offer', path: '/offers/smart' },
      { label: 'Postback', path: '/offers/postback' },
      { label: 'Approve Requests', path: '/offers/approve-requests' },
      { label: 'Coupons', path: '/offers/coupons' },
      { label: 'Offer Affiliate Links', path: '/offers/affiliate-links' }
    ]
  },
  {
    label: 'Reports / Logs',
    icon: 'reports',
    permission: 'Reports',
    children: [
      { label: 'Reports', path: '/reports' },
      { label: 'Reports KPI', path: '/reports/kpi' },
      { label: 'Conversion Logs', path: '/reports/conversion-logs' },
      { label: 'iGaming Reports', path: '/reports/igaming' },
      { label: 'Affiliate Postback Logs', path: '/reports/affiliate-postback-logs' },
      { label: 'Advertiser Postback Logs', path: '/reports/advertiser-postback-logs' },
      { label: 'Capping Logs', path: '/reports/capping-logs' },
      { label: 'Test Reports', path: '/reports/test-reports' },
      { label: 'OTP Reports', path: '/reports/otp-reports', badge: 'New' },
      { label: 'Comparison', path: '/reports/comparison', badge: 'New' }
    ]
  },
  {
    label: 'Fraud Detection',
    icon: 'shield',
    permission: 'FraudDetection',
    children: [
      { label: 'Fraud Fender', path: '/fraud-detection/fraud-fender' },
      { label: 'Conversion Risk Monitor', path: '/fraud-detection/conversion-risk-monitor' }
    ]
  },
  {
    label: 'Integration',
    icon: 'puzzle',
    permission: 'Integration',
    children: [
      { label: 'SDK', path: 'https://knowledgebase.offer18.com/network/sdk', external: true },
      { label: 'Mobile Attribution', path: '/integration/mobile-attribution' },
      { label: 'E-commerce', path: '/integration/e-commerce' },
      { label: 'Affiliate Integration', path: '/integration/affiliate-integration' },
      { label: 'Offer Sync', path: '/integration/offer-sync' },
      { label: 'Report Sync', path: '/integration/report-sync', badge: 'New' },
      { label: 'Product Feed', path: '/integration/product-feed', badge: 'New' },
      { label: 'OTP Integration', path: '/integration/otp-integration', badge: 'New' }
    ]
  },
  {
    label: 'Tools',
    icon: 'tool',
    permission: 'Tools',
    children: [
      { label: 'Integration', path: '/tools/integration' },
      { label: 'Mailer', path: '/tools/mailer' },
      { label: 'Import Data', path: '/tools/import-data' },
      { label: 'Automation', path: '/tools/automation' },
      { label: 'Link Tester', path: '/tools/link-tester' },
      { label: 'Fraud Detection', path: '/tools/fraud-detection' },
      { label: 'Short URL', path: '/tools/short-url', badge: '◆' },
      { label: 'Suppression List', path: '/tools/suppression-list', badge: '◆' }
    ]
  },
  {
    label: 'Account',
    icon: 'user',
    permission: 'Account',
    children: [
      { label: 'Settings', path: '/account/settings' },
      { label: 'Billing', path: '/account/billing' },
      { label: 'Profile', path: '/account/profile' },
      { label: 'Employee', path: '/account/employee' },
      { label: 'Security', path: '/account/security' },
      { label: 'Change logs', path: '/account/change-logs' },
      { label: 'Access logs', path: '/account/access-logs' },
      { label: 'Referral', path: '/account/referral' },
      { label: 'Logout', path: '/login', isLogout: true }
    ]
  }
];

const Sidebar = ({ isCollapsed }) => {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      const permissions = storedUser.permissions || [];
      const allowedMenu = navItems.filter(item => {
        if (item.label === 'Offers' || item.label === 'Reports / Logs' || item.label === 'Fraud Detection' || item.label === 'Integration' || item.label === 'Tools' || item.label === 'Account') return true;
        return permissions.map(p => p.toLowerCase()).includes(item.permission.toLowerCase());
      });
      setMenu(allowedMenu);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const toggleMenu = (label) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  return (
    <aside className={`of-sidebar ${isCollapsed ? 'is-collapsed' : ''}`}>
      <div className='of-logo-row'>
        <p>Company</p>
      </div>

      {!isCollapsed && <p className='of-nav-title'>Navigation</p>}

      <nav>
        <ul className='of-nav-list'>
          {menu.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <div className='of-nav-btn' onClick={() => toggleMenu(item.label)} style={{ cursor: 'pointer' }}>
                    <span className='of-nav-item-main'>
                      <Icon name={item.icon} className='of-nav-icon' />
                      {!isCollapsed && <span>{item.label}</span>}
                    </span>
                    {!isCollapsed && (
                      <Icon name='arrowRight' className={`of-arrow-icon ${openMenu === item.label ? 'rotate' : ''}`} />
                    )}
                  </div>

                  {openMenu === item.label && (
                    <ul className='of-submenu'>
                      {item.children.map((sub) => (
                        <li key={sub.label}>
                          {sub.external ? (
                            <a href={sub.path} target="_blank" rel="noopener noreferrer" className="of-submenu-item">
                              {!isCollapsed && <span>{sub.label}</span>}
                              {!isCollapsed && sub.badge && <span className="of-submenu-badge">{sub.badge}</span>}
                            </a>
                          ) : (
                            <Link
                              to={sub.path}
                              className={`of-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                              onClick={sub.isLogout ? handleLogout : undefined}
                            >
                              {!isCollapsed && <span>{sub.label}</span>}
                              {!isCollapsed && sub.badge && <span className="of-submenu-badge">{sub.badge}</span>}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={item.path} className='of-nav-btn'>
                  <span className='of-nav-item-main'>
                    <Icon name={item.icon} className='of-nav-icon' />
                    {!isCollapsed && <span>{item.label}</span>}
                  </span>
                  {!isCollapsed && <Icon name='arrowRight' className='of-arrow-icon' />}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {user?.permissions?.includes('UserManagement') && (
        <div className='of-sidebar-bottom'>
          <Link to='/user-manager' className='of-nav-btn of-secondary-row'>
            <span className='of-nav-item-main'>
              <Icon name='users' className='of-nav-icon' />
              {!isCollapsed && <span>User Manager</span>}
            </span>
            {!isCollapsed && <Icon name='arrowRight' className='of-arrow-icon' />}
          </Link>
        </div>
      )}

      <div className='of-sidebar-foot'>
        <div className='of-avatar'>{user ? user.firstName.charAt(0) : 'U'}</div>
        {!isCollapsed && user && (
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <p>{user.role}</p>
          </div>
        )}
        {!isCollapsed && (
          <Link to='/login' className='of-exit-link' onClick={handleLogout}>Logout</Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;