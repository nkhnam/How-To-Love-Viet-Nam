import React, { useState, useEffect, useCallback } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, X, Images } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

/**
 * Responsive Province Photo Gallery with full keyboard-accessible Lightbox Modal.
 */
function ProvinceGallery({ images = [], provinceName = '' }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length));
  }, [images.length]);
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightboxIndex, close, goPrev, goNext]);

  if (!images.length) {
    return (
      <EmptyState
        icon={Images}
        title="Thư viện ảnh đang được cập nhật"
        description={`Hiện chưa có ảnh thư viện cho ${provinceName}.`}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, index) => (
          <button
            key={src + index}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-heritage-paper border border-heritage-border shadow-card cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-heritage-vermilion"
          >
            <img
              src={src}
              alt={`${provinceName} - Ảnh ${index + 1}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/35 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-heritage-ink text-xs font-semibold shadow-md">
                <ZoomIn className="w-4 h-4 text-heritage-vermilion" />
                Phóng to ({index + 1}/{images.length})
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Xem ảnh ${provinceName}`}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Đóng trình xem ảnh"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Ảnh trước"
            className="absolute left-3 sm:left-6 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[82vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex]}
              alt={`${provinceName} - Ảnh ${lightboxIndex + 1}`}
              className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-3 text-sm font-medium text-stone-300">
              {provinceName} · Ảnh {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Ảnh tiếp theo"
            className="absolute right-3 sm:right-6 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}

export default ProvinceGallery;
