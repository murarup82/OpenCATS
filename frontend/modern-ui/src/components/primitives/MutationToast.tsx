import { useEffect } from 'react';

export type MutationToastTone = 'success' | 'error' | 'info';

export type MutationToastState = {
  id: number;
  message: string;
  tone: MutationToastTone;
};

type Props = {
  toast: MutationToastState | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function MutationToast({ toast, onDismiss, durationMs = 3200 }: Props) {
  useEffect(() => {
    if (!toast) {
      return;
    }
    const timerID = window.setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => {
      window.clearTimeout(timerID);
    };
  }, [durationMs, onDismiss, toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className={`modern-toast modern-toast--${toast.tone}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button
        type="button"
        className="modern-toast__close"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        x
      </button>
    </div>
  );
}
