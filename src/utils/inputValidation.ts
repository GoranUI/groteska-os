import { validateEmail, sanitizeInput, sanitizeDescription } from './securityUtils';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [fieldName: string]: string };
  sanitizedData: { [fieldName: string]: string };
}

export const validateForm = (data: Record<string, string>, rules: ValidationRules): ValidationResult => {
  const errors: { [fieldName: string]: string } = {};
  const sanitizedData: { [fieldName: string]: string } = {};

  for (const [fieldName, value] of Object.entries(data)) {
    const rule = rules[fieldName];
    if (!rule) {
      sanitizedData[fieldName] = sanitizeInput(value);
      continue;
    }

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      errors[fieldName] = `${fieldName} is required`;
      continue;
    }

    // Skip further validation if field is empty and not required
    if (!value && !rule.required) {
      sanitizedData[fieldName] = '';
      continue;
    }

    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = `${fieldName} must be at least ${rule.minLength} characters`;
      continue;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors[fieldName] = `${fieldName} must be no more than ${rule.maxLength} characters`;
      continue;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[fieldName] = `${fieldName} format is invalid`;
      continue;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[fieldName] = customError;
        continue;
      }
    }

    // Sanitize the input
    sanitizedData[fieldName] = fieldName.toLowerCase().includes('description') 
      ? sanitizeDescription(value)
      : sanitizeInput(value);
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
};

// Common validation rules
export const CommonValidationRules = {
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    maxLength: 254,
    custom: (value: string) => validateEmail(value) ? null : 'Invalid email format'
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-ZšđčćžŠĐČĆŽ\s\-\.\']+$/,
    custom: (value: string) => {
      if (/^\s+|\s+$/.test(value)) return 'Name cannot start or end with spaces';
      if (/\s{2,}/.test(value)) return 'Name cannot contain multiple consecutive spaces';
      return null;
    }
  },
  amount: {
    required: true,
    pattern: /^\d+(\.\d{1,2})?$/,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) return 'Amount must be a positive number';
      if (num > 1000000000) return 'Amount is too large';
      return null;
    }
  },
  description: {
    maxLength: 1000,
    custom: (value: string) => {
      if (/<script|javascript:|on\w+=/i.test(value)) {
        return 'Description contains invalid content';
      }
      return null;
    }
  }
};