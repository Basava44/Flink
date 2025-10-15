import React from 'react';
import { useTheme } from '../hooks/useTheme';

const BackgroundPattern = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base Background */}
      <div className={`absolute inset-0 ${
        isDark 
          ? "bg-slate-900" 
          : "bg-gray-50"
      }`}>
        
        {/* Abstract Shapes Layer 1 - Large shapes */}
        <div className={`absolute -top-40 -right-40 w-96 h-96 ${
          isDark 
            ? "bg-blue-500/10" 
            : "bg-blue-200/30"
        } rounded-[40%] rotate-12 animate-float`}></div>
        
        <div className={`absolute top-1/4 -left-32 w-80 h-80 ${
          isDark 
            ? "bg-purple-500/10" 
            : "bg-purple-200/30"
        } rounded-[30%] -rotate-12 animate-float-delayed`}></div>
        
        {/* Abstract Shapes Layer 2 - Medium shapes */}
        <div className={`absolute bottom-20 right-20 w-72 h-72 ${
          isDark 
            ? "bg-pink-500/10" 
            : "bg-pink-200/30"
        } rounded-[35%] rotate-45 animate-float-slow`}></div>
        
        <div className={`absolute top-1/3 right-1/4 w-64 h-64 ${
          isDark 
            ? "bg-cyan-500/10" 
            : "bg-cyan-200/30"
        } rounded-[45%] -rotate-6 animate-float`}></div>
        
        {/* Abstract Shapes Layer 3 - Small accent shapes */}
        <div className={`absolute bottom-1/4 left-1/3 w-48 h-48 ${
          isDark 
            ? "bg-indigo-500/10" 
            : "bg-indigo-200/30"
        } rounded-[50%] rotate-90 animate-float-delayed`}></div>
        
        <div className={`absolute top-2/3 right-1/3 w-40 h-40 ${
          isDark 
            ? "bg-violet-500/10" 
            : "bg-violet-200/30"
        } rounded-[40%] -rotate-45 animate-float-slow`}></div>

        {/* Curved Lines/Paths */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={isDark ? "text-blue-500/20" : "text-blue-400/40"} stopColor="currentColor" />
              <stop offset="100%" className={isDark ? "text-purple-500/20" : "text-purple-400/40"} stopColor="currentColor" />
            </linearGradient>
          </defs>
          <path 
            d="M 0 100 Q 250 50 500 100 T 1000 100" 
            fill="none" 
            stroke="url(#gradient1)" 
            strokeWidth="2"
            className="animate-draw"
          />
          <path 
            d="M 0 300 Q 300 250 600 300 T 1200 300" 
            fill="none" 
            stroke="url(#gradient1)" 
            strokeWidth="2"
            className="animate-draw-delayed"
          />
        </svg>

        {/* Dots Pattern */}
        <div className={`absolute inset-0 ${
          isDark 
            ? "bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.1)_1px,transparent_0)]"
            : "bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.15)_1px,transparent_0)]"
        } [background-size:40px_40px]`}></div>

        {/* Noise Texture */}
        <div className={`absolute inset-0 ${
          isDark ? "opacity-[0.02]" : "opacity-[0.03]"
        }`} 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
      </div>
    </div>
  );
};

export default BackgroundPattern;

