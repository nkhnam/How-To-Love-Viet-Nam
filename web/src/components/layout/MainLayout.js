import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAiButton from './FloatingAiButton';

/**
 * Standard page shell with unified Navbar, Footer, and Floating AI launcher.
 */
function MainLayout({ children, transparentNavbar = false, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col bg-heritage-cream text-heritage-ink">
      <Navbar transparentOnTop={transparentNavbar} />
      <main className={`flex-1 ${transparentNavbar ? '' : 'pt-[72px]'} ${className}`}>{children}</main>
      <Footer />
      <FloatingAiButton />
    </div>
  );
}

export default MainLayout;
