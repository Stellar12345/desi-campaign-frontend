import { useState, useCallback } from "react";
import type { Toast } from "@/components/ui/Toast";

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastIdCounter}`;
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? 5000, // Default 5 seconds
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: "success", title, message, duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: "error", title, message, duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: "warning", title, message, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, duration?: number) => {
      return showToast({ type: "info", title, message, duration });
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
