// src/components/ui/ThemeToggle.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-12 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label="Toggle theme"
    >
      {/* Sliding circle */}
      <motion.div
        className="w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDarkMode ? 24 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {/* Icons inside toggle */}
        {isDarkMode ? (
          <i className="fas fa-moon text-xs text-indigo-600"></i>
        ) : (
          <i className="fas fa-sun text-xs text-yellow-500"></i>
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;