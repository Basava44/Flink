import { useState, useEffect } from "react";

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    
    const saved = localStorage.getItem("flink-theme");
    if (saved) {
      return saved === "dark";
    }
    
    return false; // Default to light theme
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("dark", "light");
    
    // Add the appropriate class
    if (isDark) {
      root.classList.add("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("flink-theme", isDark ? "dark" : "light");
    
    console.log('Theme applied:', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    console.log('Toggling theme from', isDark, 'to', !isDark);
    setIsDark(prev => !prev);
  };

  return {
    isDark,
    toggleTheme,
  };
};
