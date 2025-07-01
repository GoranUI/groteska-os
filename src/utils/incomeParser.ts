
export interface ParsedIncome {
  amount: number;
  currency: "USD" | "EUR" | "RSD";
  client: string;
  date: string;
  category: "full-time" | "one-time";
  description: string;
}

export const parseIncomeCSV = (csvText: string): ParsedIncome[] => {
  console.log('Starting income CSV parsing...');
  
  const lines = csvText.split('\n');
  console.log(`Total lines in CSV: ${lines.length}`);
  
  // Find the header line
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('DATUM') && line.includes('OPIS') && line.includes('IZNOS')) {
      headerIndex = i;
      break;
    }
  }
  
  if (headerIndex === -1) {
    console.error('Could not find header row');
    throw new Error('Could not find header row with DATUM, OPIS, IZNOS columns');
  }
  
  console.log(`Found header at line ${headerIndex + 1}`);
  
  const dataLines = lines.slice(headerIndex + 1).filter(line => line.trim());
  console.log(`Processing ${dataLines.length} data lines`);
  
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
      
      const [dateStr, , description, amountStr] = parts;
      
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

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(item => item.replace(/^"(.*)"$/, '$1'));
};

const isPositiveIncome = (description: string): boolean => {
  const incomeKeywords = [
    'UPLATA', 'PRENOS', 'TRANSFER', 'SALARY', 'PAYMENT',
    'Upwork', 'FREELANCE', 'CLIENT', 'Invoice', 'OIP'
  ];
  
  return incomeKeywords.some(keyword => 
    description.toUpperCase().includes(keyword.toUpperCase())
  );
};

const extractClientFromDescription = (description: string): { client: string; category: "full-time" | "one-time" } => {
  const desc = description.toUpperCase();
  
  // Check for full-time job indicators
  const fullTimeIndicators = ['OIP', 'UPWORK', 'SALARY', 'PLATA'];
  const isFullTime = fullTimeIndicators.some(indicator => desc.includes(indicator));
  
  // Extract client names - look for patterns
  let client = "Unknown Client";
  let category: "full-time" | "one-time" = isFullTime ? "full-time" : "one-time";
  
  // Pattern 1: OIP indicates full-time job
  if (desc.includes('OIP')) {
    client = "OIP - Full-time Job";
    category = "full-time";
  }
  // Pattern 2: Upwork
  else if (desc.includes('UPWORK')) {
    client = "Upwork";
    category = "full-time";
  }
  // Pattern 3: Look for person names (common Serbian names)
  else if (desc.includes('KRISTINA SAVIC') || desc.includes('KRISTINA')) {
    client = "Kristina Savic";
    category = "one-time";
  }
  else if (desc.includes('GORAN')) {
    client = "Goran";
    category = "one-time";
  }
  else if (desc.includes('MOHAMAD') || desc.includes('MOHAMMAD')) {
    client = "Mohamad";
    category = "one-time";
  }
  // Pattern 4: Look for other common patterns
  else if (desc.includes('BEZGOTOVINSKI PRENOS')) {
    // Try to extract name after "BEZGOTOVINSKI PRENOS"
    const match = description.match(/BEZGOTOVINSKI PRENOS\s+(.+?)(?:\s+\d|$)/i);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      // Clean up common banking terms
      const cleanName = extractedName
        .replace(/REF\s*\d+/gi, '')
        .replace(/\d+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanName && cleanName.length > 2) {
        client = cleanName;
        category = "one-time";
      }
    }
  }
  else if (desc.includes('UPLATA')) {
    // Try to extract name after "UPLATA"
    const match = description.match(/UPLATA\s+(.+?)(?:\s+REF|\s+\d|$)/i);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      const cleanName = extractedName
        .replace(/REF\s*\d+/gi, '')
        .replace(/\d+/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanName && cleanName.length > 2) {
        client = cleanName;
        category = "one-time";
      }
    }
  }
  
  return { client, category };
};

const parseIncomeRow = (dateStr: string, description: string, amountStr: string): ParsedIncome | null => {
  // Parse date from DD.MM.YYYY format
  const dateParts = dateStr.split('.');
  if (dateParts.length !== 3) return null;
  
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const year = parseInt(dateParts[2]);
  const date = new Date(year, month, day);
  
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
  const amount = Math.abs(parseFloat(numericPart));
  
  if (isNaN(amount) || amount <= 0) return null;
  
  // Extract client and category using improved logic
  const { client, category } = extractClientFromDescription(description);
  
  return {
    amount,
    currency,
    client,
    date: date.toISOString().split('T')[0],
    category,
    description: description.trim()
  };
};
