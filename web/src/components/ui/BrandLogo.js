import React, { useId } from 'react';

const SIZES = {
  sm: { icon: 32, title: 'text-[17px]', sub: 'text-[10px]' },
  md: { icon: 38, title: 'text-[19px]', sub: 'text-[10px]' },
  lg: { icon: 46, title: 'text-[22px]', sub: 'text-[11px]' },
};

/**
 * Symmetrical 5-petal blooming Vietnamese Lotus (Hoa Sen) Brand Logo for HTLVN.
 */
function BrandLogo({ variant = 'light', showSubtitle = false, size = 'md', className = '' }) {
  const isDarkSurface = variant === 'dark';
  const cfg = SIZES[size] || SIZES.md;
  const rawId = useId();
  const gradId = `htlvn-lotus-bg-${rawId.replace(/:/g, '')}`;

  return (
    <span className={`inline-flex items-center gap-[10px] select-none ${className}`}>
      <svg
        width={cfg.icon}
        height={cfg.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C81E1E" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
        </defs>

        {/* Vermilion lacquer emblem tile */}
        <rect
          x="2.5"
          y="2.5"
          width="43"
          height="43"
          rx="12.5"
          fill={`url(#${gradId})`}
          stroke={isDarkSurface ? 'rgba(245, 196, 99, 0.55)' : '#7F1D1D'}
          strokeWidth="1.5"
        />

        {/* Symmetrical 5-petal Lotus radiating around base point (24, 34) */}
        <g>
          {/* Outer wide petals (-66 deg & +66 deg) */}
          <path
            d="M 24 16.5 C 19.6 21.5 20 28.8 24 34 C 28 28.8 28.4 21.5 24 16.5 Z"
            transform="rotate(-66 24 34)"
            fill="#F5C463"
            stroke="#991B1B"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <path
            d="M 24 16.5 C 19.6 21.5 20 28.8 24 34 C 28 28.8 28.4 21.5 24 16.5 Z"
            transform="rotate(66 24 34)"
            fill="#F5C463"
            stroke="#991B1B"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />

          {/* Inner diagonal petals (-34 deg & +34 deg) */}
          <path
            d="M 24 13.2 C 19 19.2 19.2 28 24 34 C 28.8 28 29 19.2 24 13.2 Z"
            transform="rotate(-34 24 34)"
            fill="#FDE68A"
            stroke="#991B1B"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M 24 13.2 C 19 19.2 19.2 28 24 34 C 28.8 28 29 19.2 24 13.2 Z"
            transform="rotate(34 24 34)"
            fill="#FDE68A"
            stroke="#991B1B"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Center upright crown petal */}
          <path
            d="M 24 10 C 18.4 16.8 18.6 27.2 24 34.2 C 29.4 27.2 29.6 16.8 24 10 Z"
            fill="#FFFBEB"
            stroke="#991B1B"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        </g>

        {/* Gentle golden lotus ripple pedestal */}
        <path
          d="M 13.5 36.8 Q 24 39.6 34.5 36.8"
          stroke="#F5C463"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      <span className="flex flex-col leading-none text-left">
        <span
          className={`font-serif font-bold tracking-tight ${cfg.title} ${
            isDarkSurface ? 'text-white' : 'text-heritage-ink'
          }`}
        >
          HTLVN
        </span>
        {showSubtitle && (
          <span
            className={`mt-[3px] font-sans font-medium tracking-wider uppercase ${cfg.sub} ${
              isDarkSurface ? 'text-amber-200/90' : 'text-heritage-muted'
            }`}
          >
            How To Love Vietnam
          </span>
        )}
      </span>
    </span>
  );
}

export default BrandLogo;
