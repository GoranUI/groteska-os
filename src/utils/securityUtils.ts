
// Security utility functions for input sanitization and validation

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous HTML/script tags
  const withoutTags = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
  
  // Limit length to prevent buffer overflow
  const maxLength = 500;
  return withoutTags.substring(0, maxLength).trim();
};

export const sanitizeDescription = (description: string): string => {
  if (!description) return '';
  
  // More restrictive sanitization for descriptions
  return description
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 1000); // Limit length
};

export const sanitizeClientName = (clientName: string): string => {
  if (!clientName) return '';
  
  // Allow only letters, numbers, spaces, and common punctuation
  const cleaned = clientName
    .replace(/[^a-zA-ZšđčćžŠĐČĆŽ0-9\s\-\.\,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
  
  return cleaned || 'Unknown Client';
};

export const validateCSVContent = (content: string): boolean => {
  // Check file size (limit to 5MB)
  if (content.length > 5 * 1024 * 1024) {
    throw new Error('File size too large. Maximum allowed size is 5MB.');
  }
  
  // Enhanced suspicious patterns detection
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /vbscript:/i,
    /data:text\/html/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /\$\{.*\}/,  // Template literals
    /import\s+/i,
    /require\s*\(/i,
    /__proto__/i,
    /constructor\s*\(/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      throw new Error('File contains potentially malicious content.');
    }
  }
  
  // Check for excessive line count (DDoS protection)
  const lines = content.split('\n');
  if (lines.length > 10000) {
    throw new Error('File contains too many rows. Maximum allowed is 10,000 rows.');
  }
  
  return true;
};

export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  // More robust email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) return false;
  
  // Additional security checks
  if (email.length > 254) return false; // RFC 5321 limit
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > 64) return false; // RFC 5321 limit
  
  return true;
};

export const logSecurityEvent = (event: string, details: any = {}) => {
  const timestamp = new Date().toISOString();
  console.warn(`[SECURITY] ${timestamp}: ${event}`, details);
  
  // In production, this should send to a proper logging service
  // Example: send to your monitoring service
};

export const validateAmount = (amount: string | number): number => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d\.\-]/g, '')) : amount;
  
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    throw new Error('Invalid amount format');
  }
  
  // Prevent extremely large amounts that could cause issues
  if (Math.abs(numAmount) > 1000000000) {
    throw new Error('Amount exceeds maximum allowed value');
  }
  
  return numAmount;
};

export const validateDate = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const [day, month, year] = dateStr.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day &&
         year >= 1900 && year <= new Date().getFullYear() + 1;
};
