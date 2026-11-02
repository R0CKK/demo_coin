/**
 * Form and input validation utilities for CarbonCoin
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.trim());
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

export function validateSignupForm(formData) {
  const errors = {};

  if (!formData.name || !formData.name.trim()) {
    errors.name = 'Name is required';
  }

  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  if (!formData.phone) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Phone number must be 10 digits';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export function validateLoginForm(formData) {
  const errors = {};

  if (!formData.emailOrPhone || !formData.emailOrPhone.trim()) {
    errors.emailOrPhone = 'Email or phone is required';
  }

  if (!formData.password) {
    errors.password = 'Password is required';
  } else if (!validatePassword(formData.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}
