import React from 'react';

/**
 * Elevated warm surface container used across cards and panels.
 */
function Card({ children, hover = false, className = '', padding = 'p-6', ...rest }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-heritage-border shadow-card ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover' : ''
      } ${padding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
