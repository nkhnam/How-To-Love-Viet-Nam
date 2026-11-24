import React from 'react';
import Navbar from '../layout/Navbar';

/**
 * Legacy Header bridge so untouched Wave 2/3 pages render the redesigned Navbar seamlessly.
 */
function Header({ backgroundColor }) {
  return <Navbar backgroundColor={backgroundColor} />;
}

export default Header;
