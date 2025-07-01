
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
}

const EXCHANGE_API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
const FALLBACK_RATES: ExchangeRates = { USD: 1, EUR: 1.1, RSD: 0.009 };

export class ExchangeRateService {
  private static cachedRates: ExchangeRates | null = null;
  private static lastFetchTime: number = 0;
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async getExchangeRates(): Promise<ExchangeRates> {
    const now = Date.now();
    
    // Return cached rates if they're still fresh
    if (this.cachedRates && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.cachedRates;
    }

    try {
      const response = await fetch(`${EXCHANGE_API_BASE_URL}/USD`);
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      
      const data: ExchangeRateResponse = await response.json();
      
      this.cachedRates = {
        USD: 1,
        EUR: 1 / data.rates.EUR,
        RSD: 1 / data.rates.RSD
      };
      
      this.lastFetchTime = now;
      return this.cachedRates;
    } catch (error) {
      console.warn('Failed to fetch real-time exchange rates, using fallback:', error);
      return FALLBACK_RATES;
    }
  }
}
