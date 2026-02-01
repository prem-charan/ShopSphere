import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordStrengthIndicator = ({ password }) => {
  const checks = {
    length: password.length >= 6,
    alphabet: /[a-zA-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const allValid = Object.values(checks).every(v => v);

  const CheckItem = ({ label, isValid }) => (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <FaCheck className="text-green-500 text-xs" />
      ) : (
        <FaTimes className="text-gray-400 text-xs" />
      )}
      <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
        {label}
      </span>
    </div>
  );

  if (!password) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
      <div className="space-y-1">
        <CheckItem label="At least 6 characters" isValid={checks.length} />
        <CheckItem label="One alphabet (a-z, A-Z)" isValid={checks.alphabet} />
        <CheckItem label="One digit (0-9)" isValid={checks.digit} />
        <CheckItem label="One special character (!@#$%...)" isValid={checks.special} />
      </div>
      {allValid && (
        <p className="mt-2 text-xs text-green-600 font-medium">Strong password!</p>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
