import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import MessageBanner from "@/src/components/MessageBanner";

type MessageVariant = "default" | "error";

type Message = {
  id: number;
  text: string;
  variant: MessageVariant;
};

type ShowMessageOptions = {
  variant?: MessageVariant;
  durationMs?: number;
};

type MessageContextValue = {
  showMessage: (text: string, options?: ShowMessageOptions) => void;
  showError: (text: string, options?: Omit<ShowMessageOptions, "variant">) => void;
};

const MessageContext = createContext<MessageContextValue | null>(null);

const DEFAULT_DURATION_MS = 4000;

export function MessageProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<Message | null>(null);
  const nextIdRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideMessage = useCallback(() => {
    clearHideTimer();
    setMessage(null);
  }, [clearHideTimer]);

  const showMessage = useCallback(
    (text: string, options?: ShowMessageOptions) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      clearHideTimer();
      nextIdRef.current += 1;

      setMessage({
        id: nextIdRef.current,
        text: trimmed,
        variant: options?.variant ?? "default",
      });

      hideTimerRef.current = setTimeout(
        hideMessage,
        options?.durationMs ?? DEFAULT_DURATION_MS,
      );
    },
    [clearHideTimer, hideMessage],
  );

  const showError = useCallback(
    (text: string, options?: Omit<ShowMessageOptions, "variant">) => {
      showMessage(text, { ...options, variant: "error" });
    },
    [showMessage],
  );

  const value = useMemo(
    () => ({
      showMessage,
      showError,
    }),
    [showMessage, showError],
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      <MessageBanner message={message} onDismiss={hideMessage} />
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error("useMessage must be used within MessageProvider");
  }

  return context;
}
