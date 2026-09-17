import React from 'react';

interface SwpLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SwpLogo: React.FC<SwpLogoProps> = ({ className = '', size = 'md' }) => {
  const svgDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
  };

  const dim = svgDimensions[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      title="SWP - Student Webpage Project Viewer"
    >
      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id="swpGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3e29bd" />
            <stop offset="100%" stopColor="#251480" />
          </linearGradient>
          <linearGradient id="swpTextGrad" x1="8" y1="12" x2="40" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0ecff" />
          </linearGradient>
        </defs>

        {/* Base Background Shape with soft rounded corners */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#swpGrad)"
          stroke="#5a45df"
          strokeWidth="1.5"
        />

        {/* Top subtle highlight */}
        <path
          d="M8 8H40"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Monogram Typography: Crisp, bold SWP */}
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fill="url(#swpTextGrad)"
          fontSize="13.5"
          fontWeight="900"
          letterSpacing="0.6"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          className="font-extrabold"
        >
          SWP
        </text>

        {/* Mini code bracket accent indicator */}
        <path
          d="M11 36L8 36M37 36L40 36"
          stroke="#8b78ff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="36" r="1.5" fill="#a597ff" />
      </svg>
    </div>
  );
};
