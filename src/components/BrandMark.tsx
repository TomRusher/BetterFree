import React from 'react';

export const BrandMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label="BetterFree logo"
  >
    <path
      d="M19.52 9.26A8 8 0 1 1 17.14 5.87"
      stroke="#8A9A86"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20.6" cy="5.4" r="1.7" fill="#9DB4E0" />
    <circle cx="12" cy="12" r="2.2" fill="#8A9A86" />
  </svg>
);
