import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
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
  }, [isDark]);

  // Apply theme immediately on mount to prevent FOUC
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("flink-theme");
    const shouldBeDark = saved === "dark";
    
    // Apply theme immediately
    root.classList.remove("dark", "light");
    if (shouldBeDark) {
      root.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

