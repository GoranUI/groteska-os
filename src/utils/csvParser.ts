
export interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
  category: string;
  currency: string;
}

export const parseCSV = (csvText: string): ParsedExpense[] => {
  const lines = csvText.split('\n');
  const expenses: ParsedExpense[] = [];
  
  // Find the header line (contains DATUM)
  const headerIndex = lines.findIndex(line => line.includes('DATUM'));
  if (headerIndex === -1) {
    throw new Error('CSV header not found. Please ensure the file contains DATUM column.');
  }
  
  // Process data lines (skip header)
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    if (columns.length < 4) continue;
    
    const dateStr = columns[0]?.trim();
    const description = columns[2]?.trim() || '';
    const amountStr = columns[3]?.trim() || '';
    
    // Parse Serbian date format (DD.MM.YYYY)
    if (!dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) continue;
    
    const [day, month, year] = dateStr.split('.');
    const date = `${year}-${month}-${day}`;
    
    // Parse Serbian amount format ("- 2.495,51 RSD")
    const amountMatch = amountStr.match(/[+-]?\s*(\d{1,3}(?:\.\d{3})*),(\d{2})/);
    if (!amountMatch) continue;
    
    const amount = parseFloat(amountMatch[1].replace(/\./g, '') + '.' + amountMatch[2]);
    if (isNaN(amount)) continue;
    
    const category = categorizeExpense(description);
    
    expenses.push({
      date,
      description: description.replace(/^Kupovina\s+/, ''),
      amount,
      category,
      currency: 'RSD'
    });
  }
  
  return expenses;
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
  if (desc.includes('zdravlja') || desc.includes('medigroup') || desc.includes('apoteka')) {
    return 'Utilities';
  }
  if (desc.includes('prevoz') || desc.includes('bus') || desc.includes('taxi')) {
    return 'Transport';
  }
  if (desc.includes('market') || desc.includes('shop') || desc.includes('store')) {
    return 'Food';
  }
  
  return 'Recurring';
};
