
import { validateDate, validateAmount, sanitizeDescription } from '../securityUtils';
import { extractClientFromDescription } from './clientExtractor';
import { ParsedIncome } from '../incomeParser';

export const parseIncomeRow = (dateStr: string, description: string, amountStr: string): ParsedIncome | null => {
  // Validate date format
  if (!validateDate(dateStr)) {
    return null;
  }
  
  const [day, month, year] = dateStr.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return null;
  
  // Parse amount - remove quotes, extract number and currency
  let cleanAmount = amountStr.replace(/"/g, '').trim();
  
  // Handle positive amounts
  if (cleanAmount.startsWith('+')) {
    cleanAmount = cleanAmount.substring(1).trim();
  }
  
  // Extract currency
  let currency: "USD" | "EUR" | "RSD" = "RSD";
  if (cleanAmount.includes('USD')) currency = "USD";
  else if (cleanAmount.includes('EUR')) currency = "EUR";
  
  // Extract numeric value
  const numericPart = cleanAmount.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  
  try {
    const amount = Math.abs(validateAmount(numericPart));
    
    if (amount <= 0) return null;
    
    // Extract client and category using improved logic
    const { client, category } = extractClientFromDescription(description);
    
    return {
      amount,
      currency,
      client,
      date: date.toISOString().split('T')[0],
      category,
      description: sanitizeDescription(description.trim())
    };
  } catch (error) {
    console.warn('Failed to validate amount:', error);
    return null;
  }
};
