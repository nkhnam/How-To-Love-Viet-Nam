import React from 'react';

/**
 * Simple warm shimmer placeholder block.
 */
function Skeleton({ className = 'h-6 w-full rounded-xl' }) {
  return <div className={`animate-pulse bg-heritage-sand/70 ${className}`} />;
}

export default Skeleton;
