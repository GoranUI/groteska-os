import { sanitizeInput, sanitizeDescription, validateCSVContent, validateAmount, validateDate, logSecurityEvent } from './securityUtils';

// Rate limiting for CSV imports
const importAttempts = new Map<string, { count: number; timestamp: number }>();
const MAX_IMPORTS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userKey = userId || 'anonymous';
  const attempts = importAttempts.get(userKey);
  
  if (!attempts) {
    importAttempts.set(userKey, { count: 1, timestamp: now });
    return true;
  }
  
  // Clean old entries
  if (now - attempts.timestamp > RATE_LIMIT_WINDOW) {
    importAttempts.set(userKey, { count: 1, timestamp: now });
    return true;
  }
  
  if (attempts.count >= MAX_IMPORTS_PER_HOUR) {
    logSecurityEvent('rate_limit_exceeded', { userId: userKey, attempts: attempts.count });
    return false;
  }
  
  attempts.count++;
  return true;
};

export interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
}

export const parseCSV = (csvText: string, userId?: string): ParsedExpense[] => {
  // Rate limiting check
  if (!checkRateLimit(userId || 'anonymous')) {
    throw new Error('Rate limit exceeded. Please wait before importing again.');
  }
  
  logSecurityEvent('csv_import_started', { userId, contentLength: csvText.length });
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
  
  // Software subscriptions
  if (desc.includes('adobe') || desc.includes('figma') || desc.includes('sketch') || desc.includes('notion') || 
      desc.includes('slack') || desc.includes('zoom') || desc.includes('teams') || desc.includes('google') || 
      desc.includes('microsoft') || desc.includes('canva') || desc.includes('miro') || desc.includes('invision') || 
      desc.includes('spotify') || desc.includes('netflix') || desc.includes('openai') || desc.includes('midjourney')) {
    return 'software-subscriptions';
  }
  
  // Equipment
  if (desc.includes('computer') || desc.includes('laptop') || desc.includes('monitor') || desc.includes('printer') || 
      desc.includes('camera') || desc.includes('desk') || desc.includes('chair') || desc.includes('hardware') || 
      desc.includes('macbook') || desc.includes('imac') || desc.includes('ipad') || desc.includes('wacom')) {
    return 'equipment';
  }
  
  // Office supplies
  if (desc.includes('paper') || desc.includes('pen') || desc.includes('pencil') || desc.includes('notebook') || 
      desc.includes('binder') || desc.includes('folder') || desc.includes('stapler') || desc.includes('clips') || 
      desc.includes('markers') || desc.includes('supplies') || desc.includes('stationery') || 
      desc.includes('papir') || desc.includes('olovka') || desc.includes('bilježnica')) {
    return 'office-supplies';
  }
  
  // Client entertainment
  if (desc.includes('restaurant') || desc.includes('dinner') || desc.includes('lunch') || desc.includes('coffee') || 
      desc.includes('meal') || desc.includes('entertainment') || desc.includes('client') || desc.includes('business') || 
      desc.includes('meeting') || desc.includes('restoran') || desc.includes('ručak') || desc.includes('večera') || 
      desc.includes('kafe') || desc.includes('klijent') || desc.includes('wolt') || desc.includes('glovo') || 
      desc.includes('donesi')) {
    return 'client-entertainment';
  }
  
  // Travel and client meetings
  if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel') || desc.includes('taxi') || 
      desc.includes('uber') || desc.includes('bus') || desc.includes('train') || desc.includes('meeting') || 
      desc.includes('conference') || desc.includes('workshop') || desc.includes('putovanje') || 
      desc.includes('sastanak') || desc.includes('prevoz') || desc.includes('putevi')) {
    return 'travel-client-meetings';
  }
  
  // Marketing and advertising
  if (desc.includes('facebook') || desc.includes('instagram') || desc.includes('linkedin') || desc.includes('google ads') || 
      desc.includes('twitter') || desc.includes('tiktok') || desc.includes('youtube') || desc.includes('marketing') || 
      desc.includes('advertising') || desc.includes('promotion') || desc.includes('campaign') || desc.includes('social media') || 
      desc.includes('reklama') || desc.includes('ads')) {
    return 'marketing-advertising';
  }
  
  // Professional services
  if (desc.includes('lawyer') || desc.includes('accountant') || desc.includes('consultant') || desc.includes('legal') || 
      desc.includes('tax') || desc.includes('bookkeeping') || desc.includes('audit') || desc.includes('advokat') || 
      desc.includes('knjigovodstvo') || desc.includes('računovodstvo') || desc.includes('pravni') || desc.includes('konsultant')) {
    return 'professional-services';
  }
  
  // Utilities
  if (desc.includes('internet') || desc.includes('phone') || desc.includes('electricity') || desc.includes('water') || 
      desc.includes('gas') || desc.includes('eps') || desc.includes('mts') || desc.includes('telekom') || 
      desc.includes('vodovod') || desc.includes('struja') || desc.includes('voda') || desc.includes('wifi') || 
      desc.includes('broadband') || desc.includes('infostan')) {
    return 'utilities';
  }
  
  // Banking fees
  if (desc.includes('bank') || desc.includes('fee') || desc.includes('transaction') || desc.includes('wire') || 
      desc.includes('transfer') || desc.includes('processing') || desc.includes('payment') || desc.includes('card') || 
      desc.includes('banka') || desc.includes('naknada') || desc.includes('provizija')) {
    return 'banking-fees';
  }
  
  // Insurance
  if (desc.includes('insurance') || desc.includes('policy') || desc.includes('coverage') || desc.includes('liability') || 
      desc.includes('professional') || desc.includes('business') || desc.includes('osiguranje') || desc.includes('polisa')) {
    return 'insurance';
  }
  
  // Taxes and compliance
  if (desc.includes('tax') || desc.includes('vat') || desc.includes('sales tax') || desc.includes('income tax') || 
      desc.includes('business tax') || desc.includes('permit') || desc.includes('license') || desc.includes('registration') || 
      desc.includes('compliance') || desc.includes('porez') || desc.includes('pdv') || desc.includes('dozvola') || 
      desc.includes('licenca')) {
    return 'taxes-compliance';
  }
  
  // Office rent
  if (desc.includes('rent') || desc.includes('lease') || desc.includes('office') || desc.includes('workspace') || 
      desc.includes('coworking') || desc.includes('kancelarija') || desc.includes('prostor')) {
    return 'office-rent';
  }
  
  // Education and training
  if (desc.includes('course') || desc.includes('training') || desc.includes('workshop') || desc.includes('seminar') || 
      desc.includes('education') || desc.includes('learning') || desc.includes('skillshare') || desc.includes('udemy') || 
      desc.includes('coursera') || desc.includes('masterclass') || desc.includes('kurs') || desc.includes('obuka') || 
      desc.includes('edukacija')) {
    return 'education-training';
  }
  
  return 'other-business';
};
