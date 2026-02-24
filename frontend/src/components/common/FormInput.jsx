import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  icon: Icon,
  rightElement,
  onBlur,
  maxLength,
  onKeyPress,
  ...props
}) => {
  // Custom handler for phone input - only allow numbers
  const handlePhoneInput = (e) => {
    if (name === 'phone') {
      const input = e.target.value;
      // Only allow digits, spaces, and hyphens
      const filtered = input.replace(/[^\d\s\-]/g, '');
      
      // Only update if value actually changed to prevent issues
      if (filtered !== e.target.value) {
        e.target.value = filtered;
      }
      
      if (onChange) {
        onChange(e);
      }
    } else if (onChange) {
      onChange(e);
    }
  };

  // Custom handler for name input - prevent numbers and special characters
  const handleNameInput = (e) => {
    if (name === 'name') {
      const input = e.target.value;
      // Only allow letters, spaces, hyphens, and apostrophes
      const filtered = input.replace(/[^a-zA-Z\s\-']/g, '');
      
      // Only update if value actually changed to prevent issues
      if (filtered !== e.target.value) {
        e.target.value = filtered;
      }
      
      if (onChange) {
        onChange(e);
      }
    } else if (onChange) {
      onChange(e);
    }
  };

  const handleInputChange = (e) => {
    if (name === 'phone') {
      handlePhoneInput(e);
    } else if (name === 'name') {
      handleNameInput(e);
    } else if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          required={required}
          maxLength={maxLength || (name === 'phone' ? 10 : undefined)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-12' : 'pr-4'} py-3 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:border-transparent ${
            error 
              ? 'border-red-500 focus:ring-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500 bg-white hover:border-gray-400'
          }`}
          placeholder={placeholder}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
      {name === 'phone' && value && !error && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span> Valid phone number
        </p>
      )}
      {name === 'name' && value && !error && (
        <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span> Valid name
        </p>
      )}
    </div>
  );
};

export default FormInput;
