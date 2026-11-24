import React from 'react';

const SIZES = {
  sm: { icon: 32, title: 'text-[17px]', sub: 'text-[10px]' },
  md: { icon: 38, title: 'text-[19px]', sub: 'text-[10px]' },
  lg: { icon: 46, title: 'text-[22px]', sub: 'text-[11px]' },
};

/**
 * Custom minimalist SVG Brand Logo for HTLVN — How To Love Vietnam.
 * Combines stylized Vietnamese lotus petals with an S-curve heritage ribbon.
 */
function BrandLogo({ variant = 'light', showSubtitle = false, size = 'md', className = '' }) {
  const isDarkSurface = variant === 'dark';
  const cfg = SIZES[size] || SIZES.md;

  return (
    <span className={`inline-flex items-center gap-[10px] select-none ${className}`}>
      <svg
        width={cfg.icon}
        height={cfg.icon}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Warm heritage emblem tile */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="12"
          fill={isDarkSurface ? 'rgba(255,255,255,0.12)' : '#B91C1C'}
          stroke={isDarkSurface ? 'rgba(255,255,255,0.22)' : '#991B1B'}
          strokeWidth="1.5"
        />
        {/* Outer lotus petals */}
        <path
          d="M22 10C18.5 14.5 17 19.5 17 24.5C17 27.8 19.2 30.5 22 31.5C24.8 30.5 27 27.8 27 24.5C27 19.5 25.5 14.5 22 10Z"
          fill="#FBF3E0"
        />
        <path
          d="M15.2 17.5C12.2 19.8 10.8 23.2 11.4 26.8C12 29.8 14.8 31.6 18.2 31.4C16.6 29.2 15.8 26.5 15.8 23.6C15.8 21.4 15.5 19.4 15.2 17.5Z"
          fill="#F5C463"
        />
        <path
          d="M28.8 17.5C31.8 19.8 33.2 23.2 32.6 26.8C32 29.8 29.2 31.6 25.8 31.4C27.4 29.2 28.2 26.5 28.2 23.6C28.2 21.4 28.5 19.4 28.8 17.5Z"
          fill="#F5C463"
        />
        {/* Subtle golden S-curve heritage ribbon */}
        <path
          d="M22 13.5C20.3 16.2 23.5 19.2 21.8 22.2C20.2 24.8 23.1 27.4 22 29.5"
          stroke="#B91C1C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Star spark */}
        <circle cx="22" cy="34.5" r="1.7" fill="#F5C463" />
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
