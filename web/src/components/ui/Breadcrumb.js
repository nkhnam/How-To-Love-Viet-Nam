import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Breadcrumb trail for deep content pages.
 */
function Breadcrumb({ items = [], dark = false, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex flex-wrap items-center gap-1.5 text-sm ${className}`}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${dark ? 'text-white/60' : 'text-heritage-muted'}`}
                aria-hidden="true"
              />
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className={`font-medium transition-colors ${
                  dark
                    ? 'text-white/80 hover:text-white'
                    : 'text-heritage-muted hover:text-heritage-vermilion'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`font-semibold ${dark ? 'text-white' : 'text-heritage-ink'}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
