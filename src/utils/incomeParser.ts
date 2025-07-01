
import { sanitizeInput, validateCSVContent } from './securityUtils';
import { parseCSVLine } from './csv/csvLineParser';
import { isPositiveIncome } from './csv/incomeDetection';
import { parseIncomeRow } from './csv/incomeRowParser';

export interface ParsedIncome {
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  client: string;
  date: string;
  category: "full-time" | "one-time";
  description: string;
}

export const parseIncomeCSV = (csvText: string): ParsedIncome[] => {
  console.log('Starting income CSV parsing with security validation...');
  
  // Validate CSV content for security
  try {
    validateCSVContent(csvText);
  } catch (error) {
    console.error('CSV security validation failed:', error);
    throw error;
  }
  
  const lines = csvText.split('\n');
  console.log(`Total lines in CSV: ${lines.length}`);
  
  // Find the header line
  const headerIndex = findHeaderIndex(lines);
  if (headerIndex === -1) {
    console.error('Could not find header row');
    throw new Error('Could not find header row with DATUM, OPIS, IZNOS columns');
  }
  
  console.log(`Found header at line ${headerIndex + 1}`);
  
  const dataLines = lines.slice(headerIndex + 1).filter(line => line.trim());
  console.log(`Processing ${dataLines.length} data lines`);
  
  return processDataLines(dataLines);
};

const findHeaderIndex = (lines: string[]): number => {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('DATUM') && line.includes('OPIS') && line.includes('IZNOS')) {
      return i;
    }
  }
  return -1;
};

const processDataLines = (dataLines: string[]): ParsedIncome[] => {
  const incomes: ParsedIncome[] = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue;
    
    try {
      const parts = parseCSVLine(line);
      
      if (parts.length < 4) {
        console.warn(`Line ${i + 1}: Not enough columns (${parts.length}), skipping`);
        continue;
      }
      
      const dateStr = sanitizeInput(parts[0] || '');
      const description = parts[2] || '';
      const amountStr = sanitizeInput(parts[3] || '');
      
      // Only process positive amounts (incomes)
      if (!amountStr.includes('+') && !isPositiveIncome(description)) {
        continue;
      }
      
      const parsedIncome = parseIncomeRow(dateStr, description, amountStr);
      if (parsedIncome) {
        incomes.push(parsedIncome);
        console.log(`Parsed income: ${parsedIncome.client} - ${parsedIncome.amount} ${parsedIncome.currency}`);
      }
    } catch (error) {
      console.warn(`Error parsing line ${i + 1}:`, error);
    }
  }
  
  console.log(`Successfully parsed ${incomes.length} income records`);
  return incomes;
};
