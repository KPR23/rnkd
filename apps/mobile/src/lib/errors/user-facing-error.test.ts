import { getUserFacingErrorMessage } from "./user-facing-error";

describe("getUserFacingErrorMessage", () => {
  it("maps raw HTTP status messages to friendly copy", () => {
    expect(getUserFacingErrorMessage("HTTP 404")).toBe(
      "We couldn't find what you were looking for.",
    );
    expect(getUserFacingErrorMessage("Request failed with status 500")).toBe(
      "Something went wrong on our side. Please try again shortly.",
    );
  });

  it("maps tRPC error metadata to friendly copy", () => {
    expect(
      getUserFacingErrorMessage({
        message: "NOT_FOUND",
        data: { code: "NOT_FOUND", httpStatus: 404 },
      }),
    ).toBe("We couldn't find what you were looking for.");
  });

  it("preserves already helpful validation messages", () => {
    expect(getUserFacingErrorMessage("This nickname is already taken")).toBe(
      "This nickname is already taken",
    );
  });
});
