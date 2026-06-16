import {
  isOnboardingProfileValid,
  normalizeOnboardingTag,
  toStoredProfileImageValue,
} from "./onboarding-utils";

describe("onboarding profile helpers", () => {
  it("normalizes nickname tags before validation", () => {
    expect(normalizeOnboardingTag("  @@KPR_23  ")).toBe("KPR_23");
    expect(isOnboardingProfileValid("Kacper", "@@KPR_23")).toBe(true);
  });

  it("rejects incomplete or invalid onboarding profile data", () => {
    expect(isOnboardingProfileValid("", "KPR_23")).toBe(false);
    expect(isOnboardingProfileValid("Kacper", "x")).toBe(false);
    expect(isOnboardingProfileValid("Kacper", "bad tag")).toBe(false);
  });

  it("stores local server avatar URLs as relative paths", () => {
    expect(
      toStoredProfileImageValue("http://localhost:3000/uploads/avatar.png"),
    ).toBe("/uploads/avatar.png");
    expect(toStoredProfileImageValue("https://cdn.example.com/avatar.png")).toBe(
      "https://cdn.example.com/avatar.png",
    );
  });
});
