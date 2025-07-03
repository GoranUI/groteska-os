import { useCallback } from 'react';
import { useToastNotifications } from './useToastNotifications';
import { logSecurityEvent } from '@/utils/securityUtils';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  additionalData?: Record<string, any>;
}

export const useErrorHandler = () => {
  const { showError } = useToastNotifications();

  const handleError = useCallback((
    error: Error | string | unknown,
    context?: ErrorContext
  ) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    // Log error for security monitoring
    logSecurityEvent('application_error', {
      errorMessage,
      errorName,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString()
    });

    // Sanitize error message to prevent information disclosure
    const sanitizeErrorMessage = (msg: string): string => {
      // Remove sensitive information patterns
      return msg
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[email]')
        .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[card]')
        .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[ip]')
        .replace(/Bearer\s+[A-Za-z0-9-._~+/]+=*/g, '[token]')
        .replace(/password[:\s=]+\S+/gi, 'password=[hidden]')
        .replace(/secret[:\s=]+\S+/gi, 'secret=[hidden]');
    };

    // Determine user-friendly message
    let userMessage = 'An unexpected error occurred';
    let description = 'Please try again or contact support if the problem persists';

    if (error instanceof Error) {
      const sanitizedMessage = sanitizeErrorMessage(errorMessage);
      
      // Handle specific error types with generic messages for security
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = 'Network Error';
        description = 'Please check your internet connection and try again';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
        userMessage = 'Access Denied';
        description = 'Please check your credentials and try again';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        userMessage = 'Validation Error';
        description = sanitizedMessage;
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        userMessage = 'Rate Limit Exceeded';
        description = 'Please wait a moment before trying again';
      } else if (context?.operation) {
        userMessage = `Error in ${context.operation}`;
        description = sanitizedMessage;
      }
    }

    // Show user-friendly error toast
    showError(userMessage, description);

    return {
      errorMessage: sanitizeErrorMessage(errorMessage),
      errorName,
      context
    };
  }, [showError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};