import React, { useEffect, useState } from "react";

export type ToastKind = "success" | "error";

export interface ToastMessage {
  kind: ToastKind;
  text: string;
}

interface ToastBannerProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const palette = {
  success: {
    background: "#ebf8ee",
    color: "#1f6b2a",
    borderColor: "#b8e3c0"
  },
  error: {
    background: "#fdeeee",
    color: "#9e2d28",
    borderColor: "#f0c2bf"
  }
} as const;

export function useToast(autoDismissMs = 3500) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [toast, autoDismissMs]);

  function showToast(kind: ToastKind, text: string) {
    setToast({ kind, text });
  }

  function dismissToast() {
    setToast(null);
  }

  return { toast, showToast, dismissToast, setToast };
}

export function ToastBanner({ toast, onDismiss }: ToastBannerProps) {
  if (!toast) return null;
  const style = palette[toast.kind];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        borderRadius: "12px",
        padding: "10px 12px",
        marginBottom: "12px",
        border: `1px solid ${style.borderColor}`,
        background: style.background,
        color: style.color
      }}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "transparent",
          color: "inherit",
          border: "1px solid currentColor",
          borderRadius: "999px",
          padding: "4px 10px",
          cursor: "pointer"
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
