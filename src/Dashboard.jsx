import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Icon from './components/Icon';
import BrandLogo from './components/BrandLogo';
import { BRAND_NAME, BRAND_TAGLINE } from './brand';
import './css/Dashboard.css';

const quickLinks = [
  { title: 'Affiliates', sub: 'Partners & payouts', path: '/affiliates', icon: 'users' },
  { title: 'Advertisers', sub: 'Accounts & billing', path: '/advertisers', icon: 'user' },
  { title: 'Create Offer', sub: 'Launch a campaign', path: '/offers/create', icon: 'offers' },
  { title: 'Reports', sub: 'Clicks & conversions', path: '/reports', icon: 'reports' },
];

const Dashboard = () => {
  const metrics = [
    { title: 'Impressions', value: '0', sub: 'MTD: 0', tone: 'pink' },
    { title: 'Clicks', value: '0', sub: 'MTD: 0', tone: 'orange' },
    { title: 'Revenue', value: '0 USD', sub: 'MTD: 0 USD', tone: 'blue' },
    { title: 'Payout', value: '0 USD', sub: 'MTD: 0 USD', tone: 'purple' },
    { title: 'Profit', value: '0 USD', sub: 'MTD: 0 USD', tone: 'green' }
  ];
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  return (
    <div className="of-layout">
    
          <Sidebar isCollapsed={isSidebarCollapsed} />
    
          <div className="of-main">
    
            <Header
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
    
            <div className="nf-dash">

              <section className="nf-hero">
                <div>
                  <p className="nf-hero-eyebrow">Dashboard</p>
                  <h2>Welcome to {BRAND_NAME}</h2>
                  <p>{BRAND_TAGLINE}. Manage affiliates, advertisers, offers and reports from one place.</p>
                </div>
                <BrandLogo showName={false} className="nf-hero-mark" />
              </section>

              <div className="nf-quick-grid">
                {quickLinks.map((link) => (
                  <Link to={link.path} className="nf-quick-card" key={link.path}>
                    <span className="nf-quick-icon"><Icon name={link.icon} /></span>
                    <span>
                      <strong>{link.title}</strong>
                      <small>{link.sub}</small>
                    </span>
                  </Link>
                ))}
              </div>

            </div>
    
          </div>
    
        </div>
    // <div className={`of-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
    //   <Sidebar isCollapsed={isSidebarCollapsed} />

    //   <section className="of-main">
    //     <Header
    //       isSidebarCollapsed={isSidebarCollapsed}
    //       onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
    //     />

    //     <div className="of-grid">
    //       <article className="of-panel of-summary">
    //         <div className="of-summary-badge">0</div>
    //         <p>0% Up from yesterday</p>
    //         <h3>Conversions</h3>
    //         <small>CR : 0%</small>
    //         <div className="of-tabline">
    //           <span>Offers</span>
    //           <span>Conversions</span>
    //         </div>
    //       </article>

    //       <article className="of-panel of-metrics">
    //         <div className="of-metric-top">
    //           <h3>Performance Overview</h3>
    //           <div className="of-selects">
    //             <button type="button">Today v</button>
    //             <button type="button">All v</button>
    //           </div>
    //         </div>

    //         <div className="of-metric-grid">
    //           {metrics.map((metric) => (
    //             <div className="of-metric-card" key={metric.title}>
    //               <div className={`of-icon ${metric.tone}`}></div>
    //               <div className="of-metric-head">
    //                 <strong>{metric.title}</strong>
    //                 <span>{metric.value}</span>
    //               </div>
    //               <div className="of-metric-foot">
    //                 <span>0% Up from yesterday</span>
    //                 <span>{metric.sub}</span>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       </article>

    //       <article className="of-panel of-right-info">
    //         <h3>Affiliate Marketing Trends</h3>
    //         <p>Read more</p>
    //         <hr />
    //         <h3>KnowledgeBase</h3>
    //         <p>Read knowledgebase to learn more</p>
    //         <hr />
    //         <h3>Account Manager</h3>
    //         <p>Shaffi</p>
    //         <hr />
    //         <h3>Signup Link</h3>
    //         <p>Affiliates, Advertisers</p>
    //       </article>

    //       <article className="of-panel of-map">
    //         <h3>Top Countries</h3>
    //         <div className="of-placeholder">Map Placeholder</div>
    //       </article>

    //       <article className="of-panel of-chart">
    //         <h3>Performance</h3>
    //         <div className="of-placeholder">Chart Placeholder</div>
    //       </article>

    //       <article className="of-panel of-donut">
    //         <h3>Top Affiliates</h3>
    //         <div className="of-ring">
    //           <div>
    //             <p>Total Conversions</p>
    //             <strong>0</strong>
    //           </div>
    //         </div>
    //       </article>
    //     </div>
    //   </section>
    // </div>
  );
};

export default Dashboard;
