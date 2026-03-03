import React from 'react';

const LoadingSkeleton = ({ message = "Processing...", show = true }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-blue-200"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-800">{message}</p>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Please wait while we process your request...
          </p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div className="progress-bar rounded-full h-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;