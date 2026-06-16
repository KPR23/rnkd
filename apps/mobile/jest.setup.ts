jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: {
    Light: "light",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
  },
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));
