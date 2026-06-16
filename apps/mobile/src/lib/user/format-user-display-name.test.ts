import {
  formatUserDisplayName,
  normalizeUserTag,
} from "./format-user-display-name";

describe("formatUserDisplayName", () => {
  it("formats users by tag when a tag is available", () => {
    expect(formatUserDisplayName({ name: "Kacper", tag: "  @@KPR23  " })).toBe(
      "KPR23",
    );
  });

  it("falls back to name when user has no tag", () => {
    expect(formatUserDisplayName({ name: "Kacper", tag: null })).toBe("Kacper");
    expect(formatUserDisplayName({ name: "Kacper", tag: "   " })).toBe(
      "Kacper",
    );
  });

  it("normalizes user tags for display", () => {
    expect(normalizeUserTag("@@rnkd")).toBe("rnkd");
  });
});
