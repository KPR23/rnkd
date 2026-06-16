import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import * as Network from "expo-network";

import { useMessage } from "@/src/lib/messages/message-provider";

type NetworkStatusContextValue = {
  isOnline: boolean | null;
  refreshNetworkStatus: () => Promise<boolean | null>;
};

const NetworkStatusContext = createContext<NetworkStatusContextValue | null>(
  null,
);

const OFFLINE_CHECK_INTERVAL_MS = 15_000;

async function readOnlineStatus() {
  const state = await Network.getNetworkStateAsync();

  if (state.isConnected === false || state.isInternetReachable === false) {
    return false;
  }

  if (state.isConnected == null && state.isInternetReachable == null) {
    return null;
  }

  return true;
}

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const { showError, showMessage } = useMessage();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const lastStatusRef = useRef<boolean | null>(null);

  const refreshNetworkStatus = useCallback(async () => {
    try {
      const nextStatus = await readOnlineStatus();
      const previousStatus = lastStatusRef.current;

      lastStatusRef.current = nextStatus;
      setIsOnline(nextStatus);

      if (nextStatus === false && previousStatus !== false) {
        showError("No internet connection. Some data may be unavailable.", {
          durationMs: 6000,
        });
      }

      if (nextStatus === true && previousStatus === false) {
        showMessage("Back online. You can refresh data again.", {
          durationMs: 3000,
        });
      }

      return nextStatus;
    } catch (error) {
      console.warn("Failed to check network status.", error);
      return null;
    }
  }, [showError, showMessage]);

  useEffect(() => {
    void refreshNetworkStatus();

    const interval = setInterval(() => {
      void refreshNetworkStatus();
    }, OFFLINE_CHECK_INTERVAL_MS);

    const subscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (state === "active") {
          void refreshNetworkStatus();
        }
      },
    );

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshNetworkStatus]);

  const value = useMemo(
    () => ({
      isOnline,
      refreshNetworkStatus,
    }),
    [isOnline, refreshNetworkStatus],
  );

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);

  if (!context) {
    throw new Error(
      "useNetworkStatus must be used within NetworkStatusProvider",
    );
  }

  return context;
}
