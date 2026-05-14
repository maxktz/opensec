"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type UseCopyOptions = {
  successMessage?: string;
  errorMessage?: string;
  resetDelayMs?: number;
};

export function useCopy(text: string, options: UseCopyOptions = {}) {
  const { successMessage, errorMessage = "Could not copy", resetDelayMs = 1800 } = options;

  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (successMessage) {
        toast.success(successMessage);
      }
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimeoutRef.current = null;
      }, resetDelayMs);
    } catch {
      toast.error(errorMessage);
    }
  }, [text, successMessage, errorMessage, resetDelayMs]);

  return { copied, copy };
}
