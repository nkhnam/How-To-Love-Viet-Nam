import React, { useState } from 'react';
import { RotateCw, CheckCircle2 } from 'lucide-react';

/**
 * Responsive 3D flippable flashcard (2:3 aspect ratio) supporting controlled or uncontrolled flip state.
 */
function FlipCard3D({
  frontImage,
  backImage,
  title = 'Thẻ di sản Việt Nam',
  categoryLabel,
  flipped: controlledFlipped,
  onFlip,
  mastered = false,
  className = '',
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isControlled = controlledFlipped !== undefined;
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;

  const handleToggle = () => {
    if (onFlip) {
      onFlip(!isFlipped);
    }
    if (!isControlled) {
      setInternalFlipped((prev) => !prev);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`${title} — ${isFlipped ? 'Mặt sau, nhấn để lật mặt trước' : 'Mặt trước, nhấn để lật mặt sau'}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`group perspective-1200 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-vermilion rounded-2xl ${className}`}
    >
      <div
        className={`relative w-full aspect-[2/3] transform-style-3d transition-transform duration-500 ease-out ${
          isFlipped ? 'rotate-y-180' : 'group-hover:-translate-y-1'
        }`}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden bg-white border border-heritage-border shadow-card">
          <img
            src={frontImage}
            alt={`${title} - Mặt trước`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-stone-950/70 backdrop-blur-sm text-white text-[11px] font-semibold">
              {categoryLabel || 'Mặt trước'}
            </span>
            {mastered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-heritage-jade text-white text-[11px] font-semibold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã thuộc
              </span>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-stone-950/75 via-stone-950/30 to-transparent flex items-center justify-center pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-heritage-ink text-xs font-semibold shadow-sm">
              <RotateCw className="w-3.5 h-3.5 text-heritage-vermilion" />
              Chạm để lật xem thông tin
            </span>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden bg-white border-2 border-heritage-gold shadow-card-hover">
          <img
            src={backImage}
            alt={`${title} - Mặt sau`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full bg-heritage-gold text-white text-[11px] font-semibold shadow-sm">
              Mặt sau · Kiến thức
            </span>
            {mastered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-heritage-jade text-white text-[11px] font-semibold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã thuộc
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlipCard3D;
