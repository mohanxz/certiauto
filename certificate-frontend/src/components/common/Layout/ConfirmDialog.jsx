import React from 'react';
import Button from '../ui/Button';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      confirmColor: 'bg-red-600 hover:bg-red-700',
      icon: 'fas fa-exclamation-triangle text-red-500',
    },
    warning: {
      confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
      icon: 'fas fa-exclamation-circle text-yellow-500',
    },
    info: {
      confirmColor: 'bg-blue-600 hover:bg-blue-700',
      icon: 'fas fa-info-circle text-blue-500',
    },
  };

  const config = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className={`${config.icon} text-lg`}></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              onClick={onConfirm}
              className={`${config.confirmColor} text-white sm:ml-3 sm:w-auto sm:text-sm`}
            >
              {confirmText}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="mt-3 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;