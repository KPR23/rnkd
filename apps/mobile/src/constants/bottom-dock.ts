export const BOTTOM_DOCK_HEIGHT = 136;

/** Compact dock when the keyboard is open — keeps actions visible without wasting space. */
export const BOTTOM_DOCK_HEIGHT_KEYBOARD = 72;

export function resolveBottomDockHeight(keyboardOffset: number) {
  return keyboardOffset > 0 ? BOTTOM_DOCK_HEIGHT_KEYBOARD : BOTTOM_DOCK_HEIGHT;
}
