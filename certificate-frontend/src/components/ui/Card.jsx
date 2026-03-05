// src/components/ui/Card.jsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const Card = ({ children, className = '', ...props }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`
        rounded-xl border transition-all duration-300
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700 shadow-gray-900/50 hover:shadow-gray-900/80' 
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      px-6 py-4 border-b transition-colors duration-300
      ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      p-6 transition-colors duration-300
      ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      px-6 py-4 border-t transition-colors duration-300
      ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;