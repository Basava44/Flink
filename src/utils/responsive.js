// Utility to detect if device is mobile based on screen width
export const isMobile = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth <= 768; // md breakpoint in Tailwind
  }
  return false;
};

// Hook to track window size changes
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const useIsMobile = () => {
  const { width } = useWindowSize();
  return width ? width <= 768 : false;
};