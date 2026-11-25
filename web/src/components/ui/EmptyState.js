import React from 'react';
import Button from './Button';

/**
 * Centered empty state for search, filter, or missing data views.
 */
function EmptyState({ icon: Icon, title, description, actionLabel, onAction, actionTo, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-heritage-border bg-white/70 ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-heritage-paper text-heritage-vermilion flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-lg font-bold text-heritage-ink mb-1">{title}</h3>
      {description && <p className="text-sm text-heritage-muted max-w-md mb-5">{description}</p>}
      {(actionLabel && (onAction || actionTo)) && (
        <Button variant="outline" size="sm" onClick={onAction} to={actionTo}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
