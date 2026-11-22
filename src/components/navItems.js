// Main navigation, shared by the sidebar (icon rail + section panel) and the top bar.
// `short` labels are set in SHORT_LABELS below (text shown under the icon in the rail).
// Items that are commented out are hidden from the menu only; their pages and routes still exist.
export const navItems = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', permission: 'Dashboard' },
  {
    label: 'Offers',
    icon: 'offers',
    permission: 'Offers',
    children: [
      { label: 'Create Offer', path: '/offers/create' },
      { label: 'Offers - Live (Today)', path: '/offers/live' },
      { label: 'Offers - Approved', path: '/offers/approved' },
      { label: 'Smart Offer', path: '/offers/smart' },
      { label: 'Postback', path: '/offers/postback' },
      { label: 'Approve Requests', path: '/offers/approve-requests' },
      // { label: 'Coupons', path: '/offers/coupons' },
      // { label: 'Offer Affiliate Links', path: '/offers/affiliate-links' }
    ]
  },
  {
    label: 'Reports',
    icon: 'reports',
    permission: 'Reports',
    children: [
      { label: 'Reports', path: '/reports' },
      // { label: 'Reports KPI', path: '/reports/kpi' },
      { label: 'Conversion Logs', path: '/reports/conversion-logs' },
      // { label: 'iGaming Reports', path: '/reports/igaming' },
      { label: 'Affiliate Postback Logs', path: '/reports/affiliate-postback-logs' },
      { label: 'Advertiser Postback Logs', path: '/reports/advertiser-postback-logs' },
      { label: 'Capping Logs', path: '/reports/capping-logs' },
      { label: 'Test Reports', path: '/reports/test-reports' },
      // { label: 'OTP Reports', path: '/reports/otp-reports', badge: 'New' },
      // { label: 'Comparison', path: '/reports/comparison', badge: 'New' }
    ]
  },
  {
    label: 'Affiliates',
    icon: 'users',
    permission: 'Affiliates',
    children: [
      { label: 'Affiliates', path: '/affiliates' },
      { label: 'Pending Affiliates', path: '/affiliates/pending' },
      { label: 'Affiliate Postback', path: '/affiliates/postback' },
      { label: 'Affiliate Billing', path: '/affiliates/billing' },
      // { label: 'Affiliate Referral', path: '/affiliates/referral' },
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
  { label: 'Employee', icon: 'users', path: '/account/employee', permission: 'Employee' },
  {
    label: 'Integration',
    icon: 'puzzle',
    permission: 'Integration',
    children: [
      { label: 'SDK', path: 'https://knowledgebase.offer18.com/network/sdk', external: true },
      { label: 'Mobile Attribution', path: '/integration/mobile-attribution' },
      // { label: 'E-commerce', path: '/integration/e-commerce' },
      // { label: 'Affiliate Integration', path: '/integration/affiliate-integration' },
      { label: 'Offer Sync', path: '/integration/offer-sync' },
      // { label: 'Report Sync', path: '/integration/report-sync', badge: 'New' },
      // { label: 'Product Feed', path: '/integration/product-feed', badge: 'New' },
      // { label: 'OTP Integration', path: '/integration/otp-integration', badge: 'New' }
    ]
  },
  {
    label: 'Tools',
    icon: 'tool',
    permission: 'Tools',
    children: [
      // { label: 'Integration', path: '/tools/integration' },
      { label: 'Mailer', path: '/tools/mailer' },
      { label: 'Import Data', path: '/tools/import-data' },
      // { label: 'Automation', path: '/tools/automation' },
      // { label: 'Link Tester', path: '/tools/link-tester' },
      { label: 'Fraud Detection', path: '/tools/fraud-detection' },
      // { label: 'Short URL', path: '/tools/short-url', badge: '◆' },
      // { label: 'Suppression List', path: '/tools/suppression-list', badge: '◆' }
    ]
  },
  // {
  //   label: 'Fraud Detection',
  //   icon: 'shield',
  //   permission: 'FraudDetection',
  //   children: [
  //     { label: 'Fraud Fender', path: '/fraud-detection/fraud-fender' },
  //     { label: 'Conversion Risk Monitor', path: '/fraud-detection/conversion-risk-monitor' }
  //   ]
  // },
  // Account pages moved to the Admin menu in the top bar (Header.jsx)
  // {
  //   label: 'Account',
  //   icon: 'user',
  //   permission: 'Account',
  //   children: [
  //     { label: 'Settings', path: '/account/settings' },
  //     { label: 'Billing', path: '/account/billing' },
  //     { label: 'Profile', path: '/account/profile' },
  //     { label: 'Employee', path: '/account/employee' },
  //     { label: 'Security', path: '/account/security' },
  //     { label: 'Change logs', path: '/account/change-logs' },
  //     { label: 'Access logs', path: '/account/access-logs' },
  //     { label: 'Referral', path: '/account/referral' },
  //     { label: 'Logout', path: '/login', isLogout: true }
  //   ]
  // },
  // Billing and Support are links in the top bar (Header.jsx)
  // { label: 'Billing', icon: 'wallet', path: '/billing', permission: 'Billing' },
  // {
  //   label: 'Support',
  //   icon: 'support',
  //   permission: 'Support',
  //   children: [
  //     { label: 'Call Support', path: '/support/call' },
  //     { label: 'Tickets', path: '/support/tickets' },
  //     { label: 'Knowledgebase', path: '/support/knowledgebase' }
  //   ]
  // },
  // {
  //   label: 'Settings',
  //   icon: 'settings',
  //   permission: 'Settings',
  //   children: [
  //     { label: 'Enable Chat', static: true },
  //     { label: 'Font Size +', static: true },
  //     { label: 'Font Size -', static: true }
  //   ]
  // }
];

const SHORT_LABELS = {
  'Reports / Logs': 'Reports',
  'Fraud Detection': 'Fraud',
};

export const shortLabel = (item) => SHORT_LABELS[item.label] || item.label;

const matches = (path, pathname) => pathname === path || pathname.startsWith(`${path}/`);

// The navigation group that owns the current route (used for highlighting).
export function findGroup(items, pathname) {
  return items.find((item) =>
    item.children
      ? item.children.some((sub) => !sub.external && !sub.static && sub.path && matches(sub.path, pathname))
      : item.path && matches(item.path, pathname)
  ) || null;
}

// Pages reached from the top bar / Admin menu or from a list row, which are not in
// the sidebar. Used for the page name shown in the top bar.
const OTHER_PAGES = [
  { path: '/account/profile', label: 'Profile', icon: 'user' },
  { path: '/account/settings', label: 'Settings', icon: 'settings' },
  { path: '/account/change-logs', label: 'Change logs', icon: 'reports' },
  { path: '/account/access-logs', label: 'Access logs', icon: 'reports' },
  { path: '/account/referral', label: 'Referral', icon: 'users' },
  { path: '/account/billing', label: 'Billing', icon: 'wallet' },
  { path: '/account/security', label: 'Security', icon: 'shield' },
  { path: '/billing', label: 'Billing', icon: 'wallet' },
  { path: '/support/call', label: 'Support', icon: 'support' },
  { path: '/support/tickets', label: 'Tickets', icon: 'support' },
  { path: '/support/knowledgebase', label: 'Knowledgebase', icon: 'support' },
  { path: '/user-manager', label: 'User Manager', icon: 'users' },
  { path: '/affiliate/', label: 'Affiliate Details', icon: 'users' },
  { path: '/advertiser/', label: 'Advertiser Details', icon: 'user' },
  { path: '/edit-user/', label: 'Edit User', icon: 'users' },
];

// The open page: its own name plus its section's icon. Picks the longest matching
// path, so "/affiliates/pending" resolves to "Pending Affiliates", not "Affiliates".
export function findPage(items, pathname) {
  let best = null;
  const consider = (path, label, icon) => {
    if (!path || path.startsWith('http')) return;
    const hit = path.endsWith('/') ? pathname.startsWith(path) : matches(path, pathname);
    if (hit && (!best || path.length > best.path.length)) best = { path, label, icon };
  };
  for (const item of items) {
    if (item.children) item.children.forEach((sub) => !sub.static && consider(sub.path, sub.label, item.icon));
    else consider(item.path, item.label, item.icon);
  }
  if (!best) OTHER_PAGES.forEach((p) => consider(p.path, p.label, p.icon));
  if (!best && /^\/offers\/[^/]+\/edit$/.test(pathname)) best = { path: pathname, label: 'Edit Offer', icon: 'offers' };
  return best;
}
