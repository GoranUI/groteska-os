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

    // Set up strengthened Content Security Policy headers
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;";
    document.head.appendChild(meta);

    // Add additional security headers
    const xFrameOptions = document.createElement('meta');
    xFrameOptions.httpEquiv = 'X-Frame-Options';
    xFrameOptions.content = 'DENY';
    document.head.appendChild(xFrameOptions);

    const xContentType = document.createElement('meta');
    xContentType.httpEquiv = 'X-Content-Type-Options';
    xContentType.content = 'nosniff';
    document.head.appendChild(xContentType);

    // Add Referrer Policy
    const referrerPolicy = document.createElement('meta');
    referrerPolicy.httpEquiv = 'Referrer-Policy';
    referrerPolicy.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicy);

    // Add Permissions Policy
    const permissionsPolicy = document.createElement('meta');
    permissionsPolicy.httpEquiv = 'Permissions-Policy';
    permissionsPolicy.content = 'camera=(), microphone=(), geolocation=(), payment=(), usb=()';
    document.head.appendChild(permissionsPolicy);

    // Add Strict Transport Security (simulated via meta tag)
    const hsts = document.createElement('meta');
    hsts.httpEquiv = 'Strict-Transport-Security';
    hsts.content = 'max-age=31536000; includeSubDomains';
    document.head.appendChild(hsts);

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
      // Clean up security headers
      try {
        document.head.removeChild(meta);
        document.head.removeChild(xFrameOptions);
        document.head.removeChild(xContentType);
        document.head.removeChild(referrerPolicy);
        document.head.removeChild(permissionsPolicy);
        document.head.removeChild(hsts);
      } catch (e) {
        // Headers may already be removed
      }
    };
  }, [user]);

  return <>{children}</>;
};