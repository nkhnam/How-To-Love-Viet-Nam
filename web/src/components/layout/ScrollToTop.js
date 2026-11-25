import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls window to top whenever route pathname changes.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
