import React from 'react';

const paths = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  dashboard: <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />,
  offers: <path d="M4 7h16v10H4zM8 4l1.5 3M16 4l-1.5 3M8 12h8" />,
  reports: <path d="M6 20V9M12 20V4M18 20v-7" />,
  users: <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" />,
  shield: <path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z" />,
  puzzle: <path d="M9 4h3a2 2 0 1 1 4 0h3v3a2 2 0 1 1 0 4v3h-3a2 2 0 1 1-4 0H9v3H6v-3a2 2 0 1 1 0-4V7h3z" />,
  tool: <path d="M6 8l2-2 10 10-2 2L6 8zm10-2l2-2 2 2-2 2-2-2zM4 20l4-1-3-3-1 4z" />,
  user: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" />,
  wallet: <path d="M3 7h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3V7zm0 0V5a2 2 0 0 1 2-2h12v4M16 13h5" />,
  support: <path d="M4 12a8 8 0 0 1 16 0v5h-4v-5a4 4 0 0 0-8 0v5H4v-5zm8 8h2" />,
  settings: <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4l-2 .7a6.8 6.8 0 0 1-.3 1l1.2 1.8-1.7 1.7-1.8-1.2a6.8 6.8 0 0 1-1 .3L14 20h-4l-.7-2a6.8 6.8 0 0 1-1-.3l-1.8 1.2-1.7-1.7 1.2-1.8a6.8 6.8 0 0 1-.3-1L4 12l2-.7c.1-.3.2-.7.3-1L5.1 8.5l1.7-1.7 1.8 1.2c.3-.1.7-.2 1-.3L10 4h4l.7 2c.3.1.7.2 1 .3l1.8-1.2 1.7 1.7-1.2 1.8c.1.3.2.7.3 1L20 12z" />,
  arrowRight: <path d="M9 6l6 6-6 6" />,
  bell: <path d="M18 16H6l1-2v-3a5 5 0 0 1 10 0v3l1 2zm-8 3h4" />,
  globe: <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18M4.5 7h15M4.5 17h15" />,
  spark: <path d="M12 4l1.5 3.5L17 9l-3.5 1.5L12 14l-1.5-3.5L7 9l3.5-1.5L12 4z" />
};

const Icon = ({ name, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {paths[name] ?? paths.dashboard}
  </svg>
);

export default Icon;
