import React from 'react';

const BADGE_VARIANTS = {
  vermilion: 'bg-heritage-vermilion-soft text-heritage-vermilion border border-red-200',
  gold: 'bg-heritage-gold-soft text-amber-800 border border-amber-200',
  jade: 'bg-heritage-jade-soft text-heritage-jade border border-teal-200',
  neutral: 'bg-heritage-paper text-heritage-muted border border-heritage-border',
  glass: 'bg-white/15 text-white border border-white/25 backdrop-blur-md',
};

/**
 * Compact status or category pill badge.
 */
function Badge({ variant = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold leading-none ${
        BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
