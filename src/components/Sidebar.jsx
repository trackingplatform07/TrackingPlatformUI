import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from './Icon';
import BrandLogo from './BrandLogo';
import { navItems, shortLabel, findGroup } from './navItems';
import { BRAND_NAME } from '../brand';
import '../css/Sidebar.css';

// Two-column navigation: a narrow icon rail with every section, and a panel
// listing the pages of the selected section. `isCollapsed` hides the panel.
const Sidebar = ({ isCollapsed: collapsedProp }) => {
  const [user, setUser] = useState(null);
  const [menu, setMenu] = useState([]);
  const location = useLocation();
  const [selected, setSelected] = useState(() => findGroup(navItems, location.pathname)?.label || null);
  // Phone/tablet slide-out drawer, opened from the header menu button.
  const [mobileOpen, setMobileOpen] = useState(false);
  const isCollapsed = collapsedProp && !mobileOpen;

  useEffect(() => {
    const toggle = () => setMobileOpen((open) => !open);
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('nf:toggle-nav', toggle);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('nf:toggle-nav', toggle);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      const permissions = storedUser.permissions || [];
      const allowedMenu = navItems.filter(item => {
        if (item.label === 'Offers' || item.label === 'Reports / Logs' || item.label === 'Fraud Detection' || item.label === 'Integration' || item.label === 'Tools' || item.label === 'Account' || item.label === 'Billing' || item.label === 'Support' || item.label === 'Settings') return true;
        return permissions.map(p => p.toLowerCase()).includes(item.permission.toLowerCase());
      });
      setMenu(allowedMenu);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const currentGroup = findGroup(navItems, location.pathname)?.label;
  const panelItem = menu.find((item) => item.label === selected && item.children);
  const showPanel = Boolean(panelItem) && !isCollapsed;

  return (
    <>
    {mobileOpen && <div className='of-nav-backdrop' onClick={() => setMobileOpen(false)} />}
    <aside className={`of-sidebar nf-shell ${isCollapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>

      <nav className='nf-rail' aria-label='Sections'>
        <ul className='nf-rail-list'>
          {menu.map((item) => {
            const isActive = item.label === (selected || currentGroup);
            const content = (
              <>
                <Icon name={item.icon} className='nf-rail-icon' />
                <span className='nf-rail-label'>{shortLabel(item)}</span>
              </>
            );
            return (
              <li key={item.label}>
                {item.children ? (
                  <button
                    type='button'
                    className={`nf-rail-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelected(item.label)}
                    aria-expanded={isActive && showPanel}
                    title={item.label}
                  >
                    {content}
                  </button>
                ) : (
                  <Link to={item.path} className={`nf-rail-item ${isActive ? 'is-active' : ''}`} title={item.label}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}

          {user?.permissions?.includes('UserManagement') && (
            <li>
              <Link
                to='/user-manager'
                className={`nf-rail-item ${location.pathname === '/user-manager' ? 'is-active' : ''}`}
                title='User Manager'
              >
                <Icon name='users' className='nf-rail-icon' />
                <span className='nf-rail-label'>Users</span>
              </Link>
            </li>
          )}
        </ul>

        <div className='nf-rail-foot'>
          <BrandLogo showName={false} />
          <span>Powered by<br /><strong>{BRAND_NAME}</strong></span>
        </div>
      </nav>

      {showPanel && (
        <div className='nf-panel'>
          <p className='nf-panel-title'>{panelItem.label}</p>
          <ul className='nf-panel-list'>
            {panelItem.children.map((sub) => (
              <li key={sub.label}>
                {sub.static ? (
                  <span className='nf-panel-item is-static'>{sub.label}</span>
                ) : sub.external ? (
                  <a href={sub.path} target='_blank' rel='noopener noreferrer' className='nf-panel-item'>
                    <span>{sub.label}</span>
                    {sub.badge && <span className='nf-panel-badge'>{sub.badge}</span>}
                  </a>
                ) : (
                  <Link
                    to={sub.path}
                    className={`nf-panel-item ${location.pathname === sub.path ? 'is-active' : ''}`}
                    onClick={sub.isLogout ? handleLogout : undefined}
                  >
                    <span>{sub.label}</span>
                    {sub.badge && <span className='nf-panel-badge'>{sub.badge}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
    </>
  );
};

export default Sidebar;
