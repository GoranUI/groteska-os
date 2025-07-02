
import { useState, useEffect, useCallback } from 'react';
import { ExchangeRateService } from '@/services/exchangeRateService';

interface ExchangeRates {
  USD: number;
  EUR: number;
  RSD: number;
}

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates>({ USD: 110, EUR: 120, RSD: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    
    try {
      if (force) {
        console.log('Force refreshing exchange rates...');
        ExchangeRateService.clearCache();
      }
      
      const newRates = await ExchangeRateService.getExchangeRates();
      setRates(newRates);
      
      const lastUpdate = ExchangeRateService.getLastUpdated();
      setLastUpdated(lastUpdate);
      
      console.log('Exchange rates updated:', newRates, 'Last updated:', lastUpdate);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
      console.error('Error fetching exchange rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
    
    // Update rates once per day (24 hours)
    const interval = setInterval(() => fetchRates(), 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const forceRefresh = useCallback(() => {
    fetchRates(true);
  }, [fetchRates]);

  return {
    rates,
    loading,
    error,
    lastUpdated,
    refetch: fetchRates,
    forceRefresh
  };
};
