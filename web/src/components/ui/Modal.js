import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog with Escape key & backdrop click dismissal.
 */
function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl', dark = false }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Hộp thoại'}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-2xl shadow-2xl overflow-hidden ${
          dark ? 'bg-stone-900 text-white' : 'bg-white text-heritage-ink border border-heritage-border'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div
            className={`flex items-center justify-between px-5 py-4 border-b ${
              dark ? 'border-stone-800' : 'border-heritage-border'
            }`}
          >
            <h3 className="text-lg font-bold font-serif">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                dark
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
