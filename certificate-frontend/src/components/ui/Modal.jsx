// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isDarkMode ? 'bg-gray-900 bg-opacity-80' : 'bg-gray-500 bg-opacity-75'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative rounded-lg shadow-xl w-full mx-4 overflow-hidden
          transform transition-all duration-300 animate-slide-up
          ${sizeClasses[size]}
          ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        `}
      >
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
          </h3>
          <button
            onClick={onClose}
            className={`
              transition-colors duration-200
              ${isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-400 hover:text-gray-600'
              }
            `}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;