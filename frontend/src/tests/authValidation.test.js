import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateSignupForm,
  validateLoginForm
} from '../lib/validation';

describe('Auth Validation Logic (TDD)', () => {
  it('validates email format correctly', () => {
    expect(validateEmail('farmer@carboncoin.in')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('validates 10-digit Indian phone numbers', () => {
    expect(validatePhone('9876543210')).toBe(true);
    expect(validatePhone('123')).toBe(false);
    expect(validatePhone('98765abcde')).toBe(false);
  });

  it('validates password minimum length of 6', () => {
    expect(validatePassword('secret123')).toBe(true);
    expect(validatePassword('123')).toBe(false);
  });

  it('returns appropriate error messages for incomplete signup', () => {
    const errors = validateSignupForm({
      name: '',
      email: 'bad',
      phone: '12',
      password: '12',
      confirmPassword: '34'
    });

    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Invalid email format');
    expect(errors.phone).toBe('Phone number must be 10 digits');
    expect(errors.password).toBe('Password must be at least 6 characters');
    expect(errors.confirmPassword).toBe('Passwords do not match');
  });

  it('returns no errors for valid signup form', () => {
    const errors = validateSignupForm({
      name: 'Raghav Sharma',
      email: 'raghav@example.com',
      phone: '9876543210',
      password: 'mypassword',
      confirmPassword: 'mypassword'
    });

    expect(Object.keys(errors).length).toBe(0);
  });

  it('validates login form requiring credentials', () => {
    const emptyErrors = validateLoginForm({ emailOrPhone: '', password: '' });
    expect(emptyErrors.emailOrPhone).toBe('Email or phone is required');
    expect(emptyErrors.password).toBe('Password is required');

    const validErrors = validateLoginForm({ emailOrPhone: 'demo@carboncoin.in', password: 'password123' });
    expect(Object.keys(validErrors).length).toBe(0);
  });
});
