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

    // Determine user-friendly message
    let userMessage = 'An unexpected error occurred';
    let description = 'Please try again or contact support if the problem persists';

    if (error instanceof Error) {
      // Handle specific error types
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userMessage = 'Network Error';
        description = 'Please check your internet connection and try again';
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        userMessage = 'Permission Denied';
        description = 'You do not have permission to perform this action';
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        userMessage = 'Validation Error';
        description = errorMessage;
      } else if (context?.operation) {
        userMessage = `Error in ${context.operation}`;
        description = errorMessage;
      }
    }

    // Show user-friendly error toast
    showError(userMessage, description);

    return {
      errorMessage,
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