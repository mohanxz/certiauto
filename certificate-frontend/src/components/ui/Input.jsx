// src/components/ui/Input.jsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon,
  endAdornment,
  required = false,
  ...rest
}) => {
  const { isDarkMode } = useTheme();

  const baseInputClasses = `
    block w-full rounded-lg border
    py-3 pr-10
    transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  `;

  const paddingLeftClass = icon ? "pl-10" : "pl-3";
  
  const borderClass = error 
    ? "border-red-500 focus:ring-red-500" 
    : isDarkMode 
      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
      : "border-gray-300 bg-white text-gray-900 placeholder-gray-500";

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <i className={`${icon} ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${baseInputClasses} ${paddingLeftClass} ${borderClass}`}
          {...rest}
        />

        {/* Right Side Icon (Eye Toggle) */}
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;