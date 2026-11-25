import React, { useState, useEffect } from 'react';

const AVATAR_TONES = [
  'bg-heritage-vermilion text-white',
  'bg-heritage-jade text-white',
  'bg-heritage-gold text-white',
  'bg-stone-700 text-white',
];

function getInitials(name) {
  const words = String(name || 'HT')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'HT';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function pickTone(name) {
  let hash = 0;
  const s = String(name || 'HTLVN');
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/**
 * Resilient avatar rendering user photo when reachable and clean Heritage initials badge on missing/failed load.
 */
function UserAvatar({
  src,
  name = 'Thành viên',
  sizeClass = 'w-9 h-9',
  textClass = 'text-xs',
  className = '',
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-heritage-border bg-heritage-paper shrink-0 ${className}`}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={`${sizeClass} rounded-full inline-flex items-center justify-center font-bold select-none border border-black/10 shrink-0 ${pickTone(
        name,
      )} ${textClass} ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}

export default UserAvatar;
