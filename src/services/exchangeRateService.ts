interface ExchangeRates {
  USD: number;
  EUR: number;
  RSD: number;
}

interface ExchangeRateResponse {
  rates: {
    USD: number;
    EUR: number;
    RSD: number;
  };
  lastUpdated: string;
  source: string;
  error?: string;
}

const SUPABASE_FUNCTION_URL = 'https://sgzgtnbwzmnozdtofyez.supabase.co/functions/v1/get-exchange-rates';
const FALLBACK_RATES: ExchangeRates = { USD: 99.32, EUR: 117.16, RSD: 1 };
const CACHE_KEY = 'exchange_rates_cache';
const LAST_FETCH_KEY = 'exchange_rates_last_fetch';

export class ExchangeRateService {
  private static cachedRates: ExchangeRates | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours to match API update frequency

  static async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Try to load from localStorage first
    this.loadFromLocalStorage();
    
    // For debugging: force fresh fetch by reducing cache duration temporarily
    const debugMode = true;
    const cacheExpired = debugMode || (now - this.lastFetchTime) > this.CACHE_DURATION;
    
    // Return cached rates if they're still fresh (unless in debug mode)
    if (this.cachedRates && !cacheExpired) {
      console.log('Using cached exchange rates:', this.cachedRates);
      return this.cachedRates;
    }

    console.log('Fetching fresh exchange rates from API...');
    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnemd0bmJ3em1ub3pkdG9meWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODIxNzQsImV4cCI6MjA2Njk1ODE3NH0.uMQdwjZQCJTBKE3No5PYaA4-vNDLG08PppLRnGon4dU',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnemd0bmJ3em1ub3pkdG9meWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODIxNzQsImV4cCI6MjA2Njk1ODE3NH0.uMQdwjZQCJTBKE3No5PYaA4-vNDLG08PppLRnGon4dU'
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data: ExchangeRateResponse = await response.json();
      console.log('API Response data:', data);
      
      this.cachedRates = data.rates;
      this.lastFetchTime = now;
      
      // Save to localStorage
      this.saveToLocalStorage();
      
      if (data.error) {
        console.warn('Exchange rate API warning:', data.error);
      }
      
      console.log('Successfully fetched exchange rates:', this.cachedRates);
      return this.cachedRates;
    } catch (error) {
      console.error('Failed to fetch real-time exchange rates:', error);
      console.log('Using fallback rates:', FALLBACK_RATES);
      
      // If we have no cached rates, use fallback
      if (!this.cachedRates) {
        this.cachedRates = FALLBACK_RATES;
        this.lastFetchTime = now;
        this.saveToLocalStorage();
      }
      
      return this.cachedRates;
    }
  }

  private static loadFromLocalStorage() {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
      
      if (cachedData && lastFetch) {
        this.cachedRates = JSON.parse(cachedData);
        this.lastFetchTime = parseInt(lastFetch, 10);
        console.log('Loaded exchange rates from localStorage:', this.cachedRates);
      }
    } catch (error) {
      console.warn('Failed to load exchange rates from localStorage:', error);
    }
  }

  private static saveToLocalStorage() {
    try {
      if (this.cachedRates) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cachedRates));
        localStorage.setItem(LAST_FETCH_KEY, this.lastFetchTime.toString());
        console.log('Saved exchange rates to localStorage');
      }
    } catch (error) {
      console.warn('Failed to save exchange rates to localStorage:', error);
    }
  }

  static clearCache() {
    this.cachedRates = null;
    this.lastFetchTime = 0;
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(LAST_FETCH_KEY);
      console.log('Exchange rate cache cleared');
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  static getLastUpdated(): Date | null {
    return this.lastFetchTime > 0 ? new Date(this.lastFetchTime) : null;
  }
}