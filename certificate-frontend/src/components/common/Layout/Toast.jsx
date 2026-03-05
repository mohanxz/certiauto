// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Toast = ({ message, type = 'info', onClose }) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: {
      bg: isDarkMode 
        ? 'bg-green-900/30 border-green-800' 
        : 'bg-green-50 border-green-200',
      icon: `fas fa-check-circle ${isDarkMode ? 'text-green-400' : 'text-green-500'}`,
      text: isDarkMode ? 'text-green-300' : 'text-green-800',
      hover: isDarkMode ? 'hover:text-green-200' : 'hover:text-gray-900',
    },
    error: {
      bg: isDarkMode 
        ? 'bg-red-900/30 border-red-800' 
        : 'bg-red-50 border-red-200',
      icon: `fas fa-exclamation-circle ${isDarkMode ? 'text-red-400' : 'text-red-500'}`,
      text: isDarkMode ? 'text-red-300' : 'text-red-800',
      hover: isDarkMode ? 'hover:text-red-200' : 'hover:text-gray-900',
    },
    warning: {
      bg: isDarkMode 
        ? 'bg-yellow-900/30 border-yellow-800' 
        : 'bg-yellow-50 border-yellow-200',
      icon: `fas fa-exclamation-triangle ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`,
      text: isDarkMode ? 'text-yellow-300' : 'text-yellow-800',
      hover: isDarkMode ? 'hover:text-yellow-200' : 'hover:text-gray-900',
    },
    info: {
      bg: isDarkMode 
        ? 'bg-blue-900/30 border-blue-800' 
        : 'bg-blue-50 border-blue-200',
      icon: `fas fa-info-circle ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`,
      text: isDarkMode ? 'text-blue-300' : 'text-blue-800',
      hover: isDarkMode ? 'hover:text-blue-200' : 'hover:text-gray-900',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`${config.bg} border rounded-lg shadow-lg p-4 max-w-sm animate-slide-up`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`${config.icon} text-lg`}></i>
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${config.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center ${
            isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;