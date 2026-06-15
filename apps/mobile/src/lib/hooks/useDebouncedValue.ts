import { useEffect, useState } from "react";

const DEFAULT_DEBOUNCE_MS = 300;

export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DEBOUNCE_MS) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}
