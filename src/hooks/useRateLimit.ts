import { useCallback, useRef } from 'react';
import { logSecurityEvent } from '@/utils/securityUtils';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  operation: string;
}

export const useRateLimit = () => {
  const attempts = useRef<Map<string, number[]>>(new Map());

  const checkRateLimit = useCallback((config: RateLimitConfig, identifier?: string): boolean => {
    const key = `${config.operation}_${identifier || 'anonymous'}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get current attempts for this key
    const currentAttempts = attempts.current.get(key) || [];

    // Filter out attempts outside the time window
    const recentAttempts = currentAttempts.filter(time => time > windowStart);

    // Check if rate limit exceeded
    if (recentAttempts.length >= config.maxAttempts) {
      logSecurityEvent('rate_limit_exceeded', {
        operation: config.operation,
        identifier: identifier || 'anonymous',
        attempts: recentAttempts.length,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Add current attempt and update the map
    recentAttempts.push(now);
    attempts.current.set(key, recentAttempts);

    return true;
  }, []);

  const rateLimitedAction = useCallback(async <T>(
    action: () => Promise<T>,
    config: RateLimitConfig,
    identifier?: string
  ): Promise<T | null> => {
    if (!checkRateLimit(config, identifier)) {
      throw new Error('Rate limit exceeded. Please wait before trying again.');
    }

    return await action();
  }, [checkRateLimit]);

  return {
    checkRateLimit,
    rateLimitedAction
  };
};

// Common rate limit configurations
export const RateLimitConfigs = {
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000, operation: 'login' }, // 5 attempts per 15 minutes
  FORM_SUBMIT: { maxAttempts: 10, windowMs: 60 * 1000, operation: 'form_submit' }, // 10 submissions per minute
  API_CALL: { maxAttempts: 100, windowMs: 60 * 1000, operation: 'api_call' }, // 100 calls per minute
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000, operation: 'password_reset' }, // 3 attempts per hour
};