// src/components/common/LoadingSkeleton.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const LoadingSkeleton = ({ message = "Processing...", show = true }) => {
  const { isDarkMode } = useTheme();
  
  if (!show) return null;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-colors duration-300 ${
      isDarkMode ? 'bg-black/70' : 'bg-black/50'
    }`}>
      <div className={`rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl transform transition-all duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Outer ring */}
            <div className={`h-16 w-16 rounded-full border-4 transition-colors duration-300 ${
              isDarkMode ? 'border-gray-700' : 'border-blue-200'
            }`}></div>
            {/* Spinning inner ring */}
            <div className={`absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-t-transparent animate-spin transition-colors duration-300 ${
              isDarkMode ? 'border-blue-400' : 'border-blue-600'
            }`}></div>
            {/* Center dot */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            } animate-pulse`}></div>
          </div>
          
          <p className={`mt-4 text-lg font-semibold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {message}
          </p>
          
          <p className={`mt-2 text-sm text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Please wait while we process your request...
          </p>
          
          {/* Progress bar */}
          <div className={`mt-4 w-full rounded-full h-2 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className={`progress-bar rounded-full h-2 transition-all duration-700 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600'
              }`}
              style={{
                width: '90%',
                animation: 'progressPulse 2s ease-in-out infinite'
              }}
            ></div>
          </div>
          
          {/* Animated dots */}
          <div className="flex mt-3 space-x-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
            }`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
            }`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full animate-bounce ${
              isDarkMode ? 'bg-pink-400' : 'bg-pink-600'
            }`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;