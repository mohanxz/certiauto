import React from 'react';

const Button = ({
  children,
  loading = false,
  icon,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className = '',
  onClick,
  type = 'button',
  title,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
    'extra-small': 'px-2 py-1 text-xs'
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const computedClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${loading ? 'relative cursor-wait' : ''}
    ${className}
  `.trim();
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={computedClasses}
      title={title}
      {...props}
    >
      {loading && (
        <i className="fas fa-spinner fa-spin absolute"></i>
      )}
      
      {icon && !loading && (
        <i className={icon}></i>
      )}
      
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;