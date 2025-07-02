
export interface CategoryRule {
  contains?: string[];
  starts_with?: string[];
  ends_with?: string[];
  amount_range?: { min?: number; max?: number };
}

export interface CategoryRules {
  [category: string]: CategoryRule;
}

// Enhanced categorization rules based on your data
const CATEGORIZATION_RULES: CategoryRules = {
  "Food": {
    contains: ["HLEB", "LIDL", "MARKET", "MAXI", "PEKARA", "TEMPO", "SPIN", "UNIVEREXPORT", "RODA", "IDEA", "MERCATOR"],
    starts_with: ["ZLATAN"]
  },
  "External Food": {
    contains: ["WOLT", "GLOVO", "MISTER", "DONESI", "FOOD"]
  },
  "Transport": {
    contains: ["BS", "GAZPROM", "GORIVO", "OMV", "PETROL", "PUT", "PREVOZ", "BUS", "TAXI", "PUTEVI"]
  },
  "Utilities": {
    contains: ["EPS", "INFOSTAN", "MTS", "TELEKOM", "VODOVOD", "STRUJA", "VODA", "GAS"]
  },
  "Software": {
    contains: ["FIVERR", "GOOGLE", "UPWORK", "MIDJOURNEY", "NAMECHEAP", "PAYPAL", "ADOBE", "SPOTIFY", "NETFLIX", "OPENAI", "GITHUB"],
    starts_with: ["GOOGLE", "ADOBE"]
  },
  "Office": {
    contains: ["KANCELARIJA", "OFFICE", "SUPPLIES", "PRINTER", "PAPIR"]
  },
  "Marketing": {
    contains: ["MARKETING", "REKLAMA", "ADS", "FACEBOOK", "INSTAGRAM", "LINKEDIN"]
  },
  "Holiday": {
    contains: ["HOTEL", "BOOKING", "AIRBNB", "TRAVEL", "PUTOVANJE", "ODMOR"]
  },
  "Recurring": {
    contains: ["NAKN", "PRENOS", "PROVIZIJA", "TROŠKOVI", "USLUGA", "MESEČNO", "GODIŠNJE"],
    amount_range: { min: 1000 } // Large recurring payments
  }
};

export const categorizeExpense = (description: string, amount?: number): string => {
  if (!description) return "Other";
  
  const upperDescription = description.toUpperCase();
  
  // Check each category rule
  for (const [category, rule] of Object.entries(CATEGORIZATION_RULES)) {
    let matches = false;
    
    // Check contains patterns
    if (rule.contains) {
      matches = rule.contains.some(pattern => upperDescription.includes(pattern));
    }
    
    // Check starts_with patterns
    if (!matches && rule.starts_with) {
      matches = rule.starts_with.some(pattern => upperDescription.startsWith(pattern));
    }
    
    // Check ends_with patterns
    if (!matches && rule.ends_with) {
      matches = rule.ends_with.some(pattern => upperDescription.endsWith(pattern));
    }
    
    // Check amount range if specified and amount is provided
    if (matches && rule.amount_range && amount !== undefined) {
      const { min, max } = rule.amount_range;
      if (min !== undefined && amount < min) matches = false;
      if (max !== undefined && amount > max) matches = false;
    }
    
    if (matches) {
      return category;
    }
  }
  
  return "Other";
};

export const getSuggestedCategory = (description: string, amount?: number): {
  category: string;
  confidence: 'high' | 'medium' | 'low';
} => {
  const category = categorizeExpense(description, amount);
  
  if (category === "Other") {
    return { category, confidence: 'low' };
  }
  
  // Determine confidence based on how specific the match was
  const upperDescription = description.toUpperCase();
  const rule = CATEGORIZATION_RULES[category];
  
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  // High confidence for exact merchant matches
  const highConfidenceKeywords = ["MAXI", "LIDL", "WOLT", "GLOVO", "EPS", "MTS", "TELEKOM"];
  if (highConfidenceKeywords.some(keyword => upperDescription.includes(keyword))) {
    confidence = 'high';
  }
  
  // Low confidence for generic patterns
  const lowConfidenceKeywords = ["MARKET", "PUT", "USLUGA"];
  if (lowConfidenceKeywords.some(keyword => upperDescription.includes(keyword))) {
    confidence = 'low';
  }
  
  return { category, confidence };
};

// Learn from user corrections (for future enhancement)
export const learnFromCorrection = (description: string, userSelectedCategory: string) => {
  // This could store user corrections in localStorage or send to backend
  // For now, we'll just log it for future implementation
  console.log(`Learning: "${description}" -> ${userSelectedCategory}`);
};
