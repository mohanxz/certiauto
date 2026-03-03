import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'fas fa-check-circle text-green-500',
      text: 'text-green-800',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'fas fa-exclamation-circle text-red-500',
      text: 'text-red-800',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: 'fas fa-exclamation-triangle text-yellow-500',
      text: 'text-yellow-800',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'fas fa-info-circle text-blue-500',
      text: 'text-blue-800',
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
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-900"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Toast;