
import { sanitizeInput, sanitizeClientName } from '../securityUtils';

export interface ClientInfo {
  client: string;
  category: "full-time" | "one-time";
}

export const extractClientFromDescription = (description: string): ClientInfo => {
  const desc = sanitizeInput(description.toUpperCase());
  
  // Check for full-time job indicators
  const fullTimeIndicators = ['OIP', 'UPWORK', 'SALARY', 'PLATA'];
  const isFullTime = fullTimeIndicators.some(indicator => desc.includes(indicator));
  
  let client = "Unknown Client";
  let category: "full-time" | "one-time" = isFullTime ? "full-time" : "one-time";
  
  // Pattern matching for different client types
  if (desc.includes('OIP')) {
    client = "OIP - Full-time Job";
    category = "full-time";
  } else if (desc.includes('UPWORK')) {
    client = "Upwork";
    category = "full-time";
  } else if (desc.includes('KRISTINA SAVIC') || desc.includes('KRISTINA')) {
    client = sanitizeClientName("Kristina Savic");
    category = "one-time";
  } else if (desc.includes('GORAN')) {
    client = sanitizeClientName("Goran");
    category = "one-time";
  } else if (desc.includes('MOHAMAD') || desc.includes('MOHAMMAD')) {
    client = sanitizeClientName("Mohamad");
    category = "one-time";
  } else if (desc.includes('BEZGOTOVINSKI PRENOS')) {
    client = extractNameFromPattern(description, /BEZGOTOVINSKI PRENOS\s+(.+?)(?:\s+\d|$)/i);
    category = "one-time";
  } else if (desc.includes('UPLATA')) {
    client = extractNameFromPattern(description, /UPLATA\s+(.+?)(?:\s+REF|\s+\d|$)/i);
    category = "one-time";
  }
  
  return { client, category };
};

const extractNameFromPattern = (description: string, pattern: RegExp): string => {
  const match = description.match(pattern);
  if (match && match[1]) {
    const extractedName = match[1].trim();
    const cleanName = extractedName
      .replace(/REF\s*\d+/gi, '')
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanName && cleanName.length > 2) {
      return sanitizeClientName(cleanName);
    }
  }
  return "Unknown Client";
};
