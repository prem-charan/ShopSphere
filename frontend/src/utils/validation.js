export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return ['Password is required'];
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one alphabet');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }

  // Remove only spaces and hyphens for display purposes
  const cleanedPhone = phone.replace(/[\s\-]/g, '');

  // Must be exactly 10 digits
  if (!/^\d{10}$/.test(cleanedPhone)) {
    return 'Phone number must be exactly 10 digits';
  }

  // For Indian phone numbers: must start with 6, 7, 8, or 9
  const firstDigit = cleanedPhone.charAt(0);
  if (firstDigit !== '6' && firstDigit !== '7' && firstDigit !== '8' && firstDigit !== '9') {
    return 'Phone number must start with 6, 7, 8, or 9';
  }

  return null;
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }

  return null;
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return 'Name is required';
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (trimmedName.length > 100) {
    return 'Name must be less than 100 characters';
  }

  // Only allow letters, spaces, hyphens, and apostrophes - NO NUMBERS
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes (no numbers or special characters)';
  }

  return null;
};
