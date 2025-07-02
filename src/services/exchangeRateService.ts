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
const FALLBACK_RATES: ExchangeRates = { USD: 110, EUR: 120, RSD: 1 };

export class ExchangeRateService {
  private static cachedRates: ExchangeRates | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour (rates update daily)

  static async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Return cached rates if they're still fresh
    if (this.cachedRates && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedRates;
    }

    try {
      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnemd0bmJ3em1ub3pkdG9meWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODIxNzQsImV4cCI6MjA2Njk1ODE3NH0.uMQdwjZQCJTBKE3No5PYaA4-vNDLG08PppLRnGon4dU',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnemd0bmJ3em1ub3pkdG9meWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODIxNzQsImV4cCI6MjA2Njk1ODE3NH0.uMQdwjZQCJTBKE3No5PYaA4-vNDLG08PppLRnGon4dU'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      
      const data: ExchangeRateResponse = await response.json();
      
      this.cachedRates = data.rates;
      this.lastFetchTime = now;
      
      if (data.error) {
        console.warn('Exchange rate API warning:', data.error);
      }
      
      return this.cachedRates;
    } catch (error) {
      console.warn('Failed to fetch real-time exchange rates, using fallback:', error);
      return FALLBACK_RATES;
    }
  }
}