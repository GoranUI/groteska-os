import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export const useToastNotifications = () => {
  const { toast } = useToast();

  const showSuccess = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 3000,
    });
  }, [toast]);

  const showError = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
      duration: 5000,
    });
  }, [toast]);

  const showInfo = useCallback((title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
      duration: 4000,
    });
  }, [toast]);

  const showCustom = useCallback((options: ToastOptions) => {
    toast({
      ...options,
      duration: options.duration || 3000,
    });
  }, [toast]);

  return {
    showSuccess,
    showError,
    showInfo,
    showCustom,
    toast, // Raw toast function for advanced usage
  };
};