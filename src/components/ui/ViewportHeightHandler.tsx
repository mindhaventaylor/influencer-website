'use client';

import { useEffect } from 'react';

export default function ViewportHeightHandler() {
  useEffect(() => {
    // Mobile viewport height fix
    function setMobileVH() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
      document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
    }
    
    // Set initial values
    setMobileVH();
    
    // Update on resize and orientation change
    window.addEventListener('resize', setMobileVH);
    window.addEventListener('orientationchange', function() {
      setTimeout(setMobileVH, 100);
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', setMobileVH);
      window.removeEventListener('orientationchange', setMobileVH);
    };
  }, []);

  return null; // This component doesn't render anything
}
