import React from 'react';
import { Link } from 'react-router-dom';

const VARIANT_CLASSES = {
  primary:
    'bg-heritage-vermilion text-white hover:bg-heritage-vermilion-dark shadow-sm border border-transparent focus-visible:ring-heritage-vermilion',
  secondary:
    'bg-heritage-jade text-white hover:bg-teal-800 shadow-sm border border-transparent focus-visible:ring-heritage-jade',
  gold:
    'bg-heritage-gold text-white hover:bg-amber-700 shadow-sm border border-transparent focus-visible:ring-heritage-gold',
  outline:
    'bg-white text-heritage-ink border border-heritage-border hover:bg-heritage-paper hover:border-stone-300 focus-visible:ring-heritage-gold',
  ghost:
    'bg-transparent text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper border border-transparent focus-visible:ring-heritage-gold',
  glass:
    'bg-white/15 text-white border border-white/30 backdrop-blur-md hover:bg-white/25 focus-visible:ring-white',
};

const SIZE_CLASSES = {
  sm: 'h-[36px] px-[14px] text-[13px] rounded-[10px] gap-[6px]',
  md: 'h-[42px] px-[18px] text-[14px] rounded-[12px] gap-[8px]',
  lg: 'h-[48px] px-[24px] text-[15px] rounded-[14px] gap-[8px]',
};

/**
 * Shared Heritage-styled button supporting native button, React Router Link, and external anchor.
 */
function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  children,
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';
  const classes = `${base} ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary} ${
    SIZE_CLASSES[size] || SIZE_CLASSES.md
  } ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

export default Button;
