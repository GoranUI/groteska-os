
export interface CategoryRule {
  contains?: string[];
  starts_with?: string[];
  ends_with?: string[];
  amount_range?: { min?: number; max?: number };
}

export interface CategoryRules {
  [category: string]: CategoryRule;
}

// Enhanced categorization rules for design agency business operations
const CATEGORIZATION_RULES: CategoryRules = {
  "office-rent": {
    contains: ["RENT", "LEASE", "OFFICE", "WORKSPACE", "COWORKING", "KANCELARIJA", "PROSTOR"],
    starts_with: ["RENT", "LEASE"]
  },
  "equipment": {
    contains: ["COMPUTER", "LAPTOP", "MONITOR", "PRINTER", "CAMERA", "DESK", "CHAIR", "HARDWARE", "MACBOOK", "IMAC", "IPAD", "WACOM", "EQUIPMENT"],
    starts_with: ["APPLE", "DELL", "HP", "LENOVO"]
  },
  "software-subscriptions": {
    contains: ["ADOBE", "FIGMA", "SKETCH", "NOTION", "SLACK", "ZOOM", "TEAMS", "GOOGLE", "MICROSOFT", "CANVA", "MIRO", "INVISION", "PRINCIPLE", "AFTER", "PHOTOSHOP", "ILLUSTRATOR", "INDESIGN", "XD", "SUBSCRIPTION", "MONTHLY", "ANNUAL"],
    starts_with: ["ADOBE", "GOOGLE", "MICROSOFT", "FIGMA", "SKETCH"]
  },
  "marketing-advertising": {
    contains: ["FACEBOOK", "INSTAGRAM", "LINKEDIN", "GOOGLE ADS", "TWITTER", "TIKTOK", "YOUTUBE", "MARKETING", "ADVERTISING", "PROMOTION", "CAMPAIGN", "SOCIAL MEDIA", "REKLAMA", "ADS"],
    starts_with: ["FACEBOOK", "GOOGLE ADS", "LINKEDIN"]
  },
  "professional-services": {
    contains: ["LAWYER", "ACCOUNTANT", "CONSULTANT", "LEGAL", "TAX", "BOOKKEEPING", "AUDIT", "ADVOKAT", "KNJIGOVODSTVO", "RAČUNOVODSTVO", "PRAVNI", "KONSULTANT"],
    starts_with: ["LEGAL", "TAX", "AUDIT"]
  },
  "travel-client-meetings": {
    contains: ["TRAVEL", "FLIGHT", "HOTEL", "TAXI", "UBER", "BUS", "TRAIN", "MEETING", "CLIENT", "CONFERENCE", "WORKSHOP", "PUTOVANJE", "SASTANAK", "KLIJENT"],
    starts_with: ["TRAVEL", "MEETING", "CONFERENCE"]
  },
  "education-training": {
    contains: ["COURSE", "TRAINING", "WORKSHOP", "SEMINAR", "EDUCATION", "LEARNING", "SKILLSHARE", "UDEMY", "COURSERA", "MASTERCLASS", "KURS", "OBUKA", "EDUKACIJA"],
    starts_with: ["COURSE", "TRAINING", "WORKSHOP"]
  },
  "insurance": {
    contains: ["INSURANCE", "POLICY", "COVERAGE", "LIABILITY", "PROFESSIONAL", "BUSINESS", "OSIGURANJE", "POLISA"],
    starts_with: ["INSURANCE", "POLICY"]
  },
  "utilities": {
    contains: ["INTERNET", "PHONE", "ELECTRICITY", "WATER", "GAS", "EPS", "MTS", "TELEKOM", "VODOVOD", "STRUJA", "VODA", "GAS", "WIFI", "BROADBAND"],
    starts_with: ["INTERNET", "PHONE", "ELECTRICITY"]
  },
  "office-supplies": {
    contains: ["PAPER", "PEN", "PENCIL", "NOTEBOOK", "BINDER", "FOLDER", "STAPLER", "CLIPS", "MARKERS", "SUPPLIES", "STATIONERY", "PAPIR", "OLOVKA", "BILJEŽNICA"],
    starts_with: ["PAPER", "PEN", "NOTEBOOK"]
  },
  "client-entertainment": {
    contains: ["RESTAURANT", "DINNER", "LUNCH", "COFFEE", "MEAL", "ENTERTAINMENT", "CLIENT", "BUSINESS", "MEETING", "RESTORAN", "RUČAK", "VEČERA", "KAFE", "KLIJENT"],
    starts_with: ["RESTAURANT", "DINNER", "LUNCH"]
  },
  "banking-fees": {
    contains: ["BANK", "FEE", "TRANSACTION", "WIRE", "TRANSFER", "PROCESSING", "PAYMENT", "CARD", "BANKA", "NAKNADA", "PROVIZIJA", "TRANSFER"],
    starts_with: ["BANK", "FEE", "TRANSACTION"]
  },
  "taxes-compliance": {
    contains: ["TAX", "VAT", "SALES TAX", "INCOME TAX", "BUSINESS TAX", "PERMIT", "LICENSE", "REGISTRATION", "COMPLIANCE", "POREZ", "PDV", "DOZVOLA", "LICENCA"],
    starts_with: ["TAX", "VAT", "PERMIT"]
  },
  "other-business": {
    contains: ["BUSINESS", "MISC", "OTHER", "GENERAL", "VARIOUS", "SUNDRY", "POSLOVNI", "OSTALO", "RAZNO"],
    amount_range: { min: 100 } // Catch-all for business expenses
  }
};

export const categorizeExpense = (description: string, amount?: number): string => {
  if (!description) return "other-business";
  
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
  
  return "other-business";
};

export const getSuggestedCategory = (description: string, amount?: number): {
  category: string;
  confidence: 'high' | 'medium' | 'low';
} => {
  const category = categorizeExpense(description, amount);
  
  if (category === "other-business") {
    return { category, confidence: 'low' };
  }
  
  // Determine confidence based on how specific the match was
  const upperDescription = description.toUpperCase();
  const rule = CATEGORIZATION_RULES[category];
  
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  // High confidence for exact business service matches
  const highConfidenceKeywords = ["ADOBE", "FIGMA", "GOOGLE", "MICROSOFT", "FACEBOOK", "LINKEDIN", "APPLE", "DELL"];
  if (highConfidenceKeywords.some(keyword => upperDescription.includes(keyword))) {
    confidence = 'high';
  }
  
  // Low confidence for generic patterns
  const lowConfidenceKeywords = ["BUSINESS", "MISC", "OTHER", "GENERAL"];
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
  if (!description) return { category: "other-business", confidence: 'low' };

  // First check if we've learned this pattern before
  const learnedCategory = learner.getLearnedCategory(description);
  if (learnedCategory) {
    return { category: learnedCategory, confidence: 'high' };
  }

  // Fall back to existing categorization
  const result = getSuggestedCategory(description, amount);
  
  // Enhance confidence based on additional factors
  if (amount) {
    // Large amounts in equipment or professional services get confidence boost
    if ((result.category === "equipment" || result.category === "professional-services") && amount > 10000) {
      result.confidence = result.confidence === 'low' ? 'medium' : 'high';
    }
    
    // Small amounts in office supplies get confidence boost
    if (result.category === "office-supplies" && amount < 5000) {
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
