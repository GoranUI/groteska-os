import { sanitizeInput, sanitizeDescription, validateCSVContent, validateAmount, validateDate } from './securityUtils';

export interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
}

export const parseCSV = (csvText: string): ParsedExpense[] => {
  console.log('Starting CSV parsing with security validation...');
  
  // Validate CSV content for security
  try {
    validateCSVContent(csvText);
  } catch (error) {
    console.error('CSV security validation failed:', error);
    throw error;
  }
  
  const lines = csvText.split('\n');
  const expenses: ParsedExpense[] = [];
  
  // Find the header line (contains DATUM)
  const headerIndex = lines.findIndex(line => line.includes('DATUM'));
  if (headerIndex === -1) {
    throw new Error('CSV header not found. Please ensure the file contains DATUM column.');
  }
  
  console.log('Header found at line:', headerIndex);
  
  // Process data lines (skip header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    console.log('Processing line:', i, line);
    
    try {
      // Split by comma but handle quoted strings
      const columns = parseCSVLine(line);
      console.log('Parsed columns:', columns);
      
      if (columns.length < 4) {
        console.log('Skipping line - not enough columns:', columns.length);
        continue;
      }
      
      const dateStr = sanitizeInput(columns[0]?.trim() || '');
      const transactionType = sanitizeInput(columns[1]?.trim() || '');
      const description = sanitizeDescription(columns[2]?.trim() || '');
      const amountStr = sanitizeInput(columns[3]?.trim() || '');
      
      console.log('Sanitized - Date:', dateStr, 'Type:', transactionType, 'Description:', description, 'Amount:', amountStr);
      
      // Validate date format
      if (!validateDate(dateStr)) {
        console.log('Skipping line - invalid date format:', dateStr);
        continue;
      }
      
      const [day, month, year] = dateStr.split('.');
      const date = `${year}-${month}-${day}`;
      
      // Parse Serbian amount format ("- 2.495,51 RSD")
      const amountMatch = amountStr.match(/[+-]?\s*(\d{1,3}(?:\.\d{3})*),(\d{2})\s*RSD/);
      if (!amountMatch) {
        console.log('Skipping line - invalid amount format:', amountStr);
        continue;
      }
      
      const amount = validateAmount(amountMatch[1].replace(/\./g, '') + '.' + amountMatch[2]);
      
      const category = categorizeExpense(description);
      
      console.log('Adding expense:', { date, description: description.replace(/^Kupovina\s+/, ''), amount, category });
      
      expenses.push({
        date,
        description: description.replace(/^Kupovina\s+/, ''),
        amount,
        category,
        currency: 'RSD'
      });
    } catch (error) {
      console.warn(`Error processing line ${i + 1}:`, error);
      // Continue processing other lines instead of failing entirely
    }
  }
  
  console.log('Total expenses parsed:', expenses.length);
  return expenses;
};

// Helper function to parse CSV line with proper comma handling
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Add the last field
  return result;
};

const categorizeExpense = (description: string): string => {
  const desc = description.toLowerCase();
  
  if (desc.includes('upwork')) {
    return 'Office';
  }
  if (desc.includes('wolt') || desc.includes('glovo') || desc.includes('donesi')) {
    return 'External Food';
  }
  if (desc.includes('pekara') || desc.includes('hleb') || desc.includes('kifle')) {
    return 'Food';
  }
  if (desc.includes('zdravlja') || desc.includes('medigroup') || desc.includes('apoteka') || desc.includes('medical')) {
    return 'Utilities';
  }
  if (desc.includes('prevoz') || desc.includes('bus') || desc.includes('taxi') || desc.includes('putevi')) {
    return 'Transport';
  }
  if (desc.includes('market') || desc.includes('shop') || desc.includes('store') || desc.includes('maxi') || desc.includes('tempo') || desc.includes('lidl')) {
    return 'Food';
  }
  if (desc.includes('spotify') || desc.includes('netflix') || desc.includes('google') || desc.includes('openai') || desc.includes('midjourney')) {
    return 'Software';
  }
  if (desc.includes('telekom') || desc.includes('mts') || desc.includes('eps') || desc.includes('infostan')) {
    return 'Utilities';
  }
  
  return 'Recurring';
};
