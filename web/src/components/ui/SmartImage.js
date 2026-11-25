import React, { useState, useEffect } from 'react';

/**
 * Image component with guarded single-step fallback when remote URLs fail (e.g. Firebase Storage 402).
 */
function SmartImage({ src, fallbackSrc = '/Img/background5.jpg', alt = '', className = '', ...rest }) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [didFallback, setDidFallback] = useState(!src);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setDidFallback(!src);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!didFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      setDidFallback(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return <img src={currentSrc || fallbackSrc} alt={alt} onError={handleError} className={className} {...rest} />;
}

export default SmartImage;
