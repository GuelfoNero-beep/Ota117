
import React from 'react';

const MasonicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="M12 3l9 15-9 3-9-3z" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

export default MasonicIcon;
