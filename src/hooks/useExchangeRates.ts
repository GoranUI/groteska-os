
import { useState, useEffect } from 'react';
import { ExchangeRateService } from '@/services/exchangeRateService';

interface ExchangeRates {
  USD: number;
  EUR: number;
  RSD: number;
}

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates>({ USD: 110, EUR: 120, RSD: 1 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const newRates = await ExchangeRateService.getExchangeRates();
      setRates(newRates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    
    // Update rates every 30 minutes
    const interval = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    rates,
    loading,
    lastUpdated,
    refetch: fetchRates
  };
};
