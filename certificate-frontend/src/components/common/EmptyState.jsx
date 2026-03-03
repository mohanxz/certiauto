import React from 'react';
import Button from '../ui/Button';

const EmptyState = ({
  title = "No data found",
  description = "There's nothing to display here yet.",
  icon = "fas fa-inbox",
  actionText,
  onAction,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center">
          <i className={`${icon} text-3xl text-blue-500`}></i>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
          icon="fas fa-plus"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;