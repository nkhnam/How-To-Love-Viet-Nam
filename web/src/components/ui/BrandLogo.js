import React from 'react';

const SIZES = {
  sm: { img: 'h-[28px]', darkImg: 'h-[24px]', title: 'text-[17px]', sub: 'text-[10px]' },
  md: { img: 'h-[34px]', darkImg: 'h-[28px]', title: 'text-[19px]', sub: 'text-[10px]' },
  lg: { img: 'h-[42px]', darkImg: 'h-[36px]', title: 'text-[22px]', sub: 'text-[11px]' },
};

/**
 * Brand Logo for HTLVN — How To Love Vietnam using the project's original lotus mark.
 */
function BrandLogo({ variant = 'light', showSubtitle = false, size = 'md', className = '' }) {
  const isDarkSurface = variant === 'dark';
  const cfg = SIZES[size] || SIZES.md;

  return (
    <span className={`inline-flex items-center gap-[10px] select-none ${className}`}>
      {isDarkSurface ? (
        <span className="inline-flex items-center justify-center bg-white/95 rounded-[11px] px-[6px] py-[4px] shadow-sm shrink-0">
          <img
            src="/Img/htlvn-logo.png"
            alt="Logo HTLVN"
            className={`${cfg.darkImg} w-auto object-contain block`}
          />
        </span>
      ) : (
        <img
          src="/Img/htlvn-logo.png"
          alt="Logo HTLVN"
          className={`${cfg.img} w-auto object-contain shrink-0 block`}
        />
      )}

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
