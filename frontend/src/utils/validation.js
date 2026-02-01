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

  const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');

  if (!/^\+?\d{10,15}$/.test(cleanedPhone)) {
    return 'Invalid phone number format. Use 10-15 digits.';
  }

  // Extract the actual phone number (remove country code if present)
  let phoneNumber = cleanedPhone;
  if (cleanedPhone.startsWith('+91')) {
    phoneNumber = cleanedPhone.substring(3);
  } else if (cleanedPhone.startsWith('+')) {
    phoneNumber = cleanedPhone.substring(1);
  }

  // For Indian phone numbers: must be 10 digits and start with 6, 7, 8, or 9
  if (phoneNumber.length === 10) {
    const firstDigit = phoneNumber.charAt(0);
    if (firstDigit !== '6' && firstDigit !== '7' && firstDigit !== '8' && firstDigit !== '9') {
      return 'Invalid phone number';
    }
  } else {
    return 'Phone number must be 10 digits';
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

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }

  return null;
};
