import React, { useId } from 'react';
import { BRAND_NAME } from '../brand';
import '../css/BrandLogo.css';

// Logo mark + wordmark. `showName={false}` renders the mark only (collapsed sidebar).
const BrandLogo = ({ showName = true, tone = 'light', className = '' }) => {
  const gradientId = `nf-grad-${useId().replace(/:/g, '')}`;

  return (
    <span className={`nf-brand nf-brand--${tone} ${className}`}>
      <svg className="nf-brand-mark" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset=".55" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
        <path d="M9.5 23V9h2.6l7.4 9.6V9h3v14h-2.6l-7.4-9.6V23z" fill="#fff" />
        <path d="M26 3.6l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" fill="#fde68a" />
      </svg>
      {showName && <span className="nf-brand-name">{BRAND_NAME}</span>}
    </span>
  );
};

export default BrandLogo;
