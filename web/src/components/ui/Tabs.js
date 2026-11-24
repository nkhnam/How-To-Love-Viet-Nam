import React from 'react';

/**
 * Accessible horizontal tab bar with optional Lucide icons and count pills.
 */
function Tabs({ items, activeKey, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none ${className}`}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.key)}
            className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer border ${
              isActive
                ? 'bg-heritage-vermilion text-white border-heritage-vermilion shadow-sm'
                : 'bg-white text-heritage-muted border-heritage-border hover:text-heritage-ink hover:bg-heritage-paper'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-heritage-paper text-heritage-muted'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
