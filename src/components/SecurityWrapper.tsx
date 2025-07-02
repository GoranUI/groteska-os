import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logSecurityEvent } from '@/utils/securityUtils';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export const SecurityWrapper = ({ children }: SecurityWrapperProps) => {
  const { user } = useAuth();

  useEffect(() => {
    // Log authentication events
    if (user) {
      logSecurityEvent('user_authenticated', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      });
    }

    // Set up Content Security Policy headers programmatically
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self';";
    document.head.appendChild(meta);

    // Monitor for suspicious activity
    const handleError = (event: ErrorEvent) => {
      logSecurityEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logSecurityEvent('unhandled_promise_rejection', {
        reason: event.reason,
        userId: user?.id,
        timestamp: new Date().toISOString()
      });
    };

    // Add event listeners for security monitoring
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      document.head.removeChild(meta);
    };
  }, [user]);

  return <>{children}</>;
};