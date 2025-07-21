
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

// Enhanced machine learning-like pattern storage
class CategoryLearner {
  private corrections: Map<string, string> = new Map();
  
  learnCorrection(description: string, correctCategory: string) {
    const key = description.toLowerCase().trim();
    this.corrections.set(key, correctCategory);
    
    // Store in localStorage for persistence
    const stored = JSON.parse(localStorage.getItem('categoryLearning') || '{}');
    stored[key] = correctCategory;
    localStorage.setItem('categoryLearning', JSON.stringify(stored));
  }
  
  getLearnedCategory(description: string): string | null {
    const key = description.toLowerCase().trim();
    
    // Check memory first
    if (this.corrections.has(key)) {
      return this.corrections.get(key)!;
    }
    
    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('categoryLearning') || '{}');
    if (stored[key]) {
      this.corrections.set(key, stored[key]);
      return stored[key];
    }
    
    // Fuzzy matching for similar descriptions
    for (const [learnedDesc, category] of Object.entries(stored)) {
      if (this.calculateSimilarity(key, learnedDesc) > 0.85) {
        return category as string;
      }
    }
    
    return null;
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}

const learner = new CategoryLearner();

// Enhanced getSuggestedCategory that incorporates learning
export const getEnhancedSuggestedCategory = (description: string, amount?: number): {
  category: string;
  confidence: 'high' | 'medium' | 'low';
} => {
  if (!description) return { category: "Other", confidence: 'low' };

  // First check if we've learned this pattern before
  const learnedCategory = learner.getLearnedCategory(description);
  if (learnedCategory) {
    return { category: learnedCategory, confidence: 'high' };
  }

  // Fall back to existing categorization
  const result = getSuggestedCategory(description, amount);
  
  // Enhance confidence based on additional factors
  if (amount) {
    // Large amounts in utilities or recurring get confidence boost
    if ((result.category === "Utilities" || result.category === "Recurring") && amount > 5000) {
      result.confidence = result.confidence === 'low' ? 'medium' : 'high';
    }
    
    // Small amounts in food categories get confidence boost
    if ((result.category === "Food" || result.category === "External Food") && amount < 2000) {
      result.confidence = result.confidence === 'low' ? 'medium' : 'high';
    }
  }

  return result;
};

// Learn from user corrections (enhanced version)
export const learnFromCorrection = (description: string, userSelectedCategory: string) => {
  learner.learnCorrection(description, userSelectedCategory);
  console.log(`Learning: "${description}" -> ${userSelectedCategory}`);
};
