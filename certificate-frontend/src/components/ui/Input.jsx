// src/components/ui/Input.jsx
import React from "react";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon,
  endAdornment, // ✅ ADD THIS
  required = false,
  ...rest
}) => {
  const baseInputClasses = `
    block w-full rounded-lg border
    py-3 pr-10
    transition-colors duration-200
    placeholder:text-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  `;

  const paddingLeftClass = icon ? "pl-10" : "pl-3";
  const borderClass = error ? "border-red-300" : "border-gray-300";

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <i className={`${icon} text-gray-400`} />
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

        {/* ✅ Right Side Icon (Eye Toggle) */}
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endAdornment}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Input;