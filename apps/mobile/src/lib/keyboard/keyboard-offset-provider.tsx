import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Keyboard, Platform, type KeyboardEvent } from "react-native";

const KeyboardOffsetContext = createContext(0);

function readKeyboardOffset(event: KeyboardEvent) {
  return event.endCoordinates.height;
}

export function KeyboardOffsetProvider({ children }: { children: ReactNode }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setOffset(readKeyboardOffset(event));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setOffset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <KeyboardOffsetContext.Provider value={offset}>
      {children}
    </KeyboardOffsetContext.Provider>
  );
}

export function useKeyboardOffset() {
  return useContext(KeyboardOffsetContext);
}
