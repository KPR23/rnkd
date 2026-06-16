import { fireEvent, render, screen } from "@testing-library/react-native";

import Button from "./Button";

describe("Button", () => {
  it("renders the action text and calls the press handler", () => {
    const onPress = jest.fn();

    render(
      <Button actionText="Save changes" variant="primary" onPress={onPress} />,
    );

    fireEvent.press(screen.getByText("Save changes"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call the press handler when disabled", () => {
    const onPress = jest.fn();

    render(
      <Button
        actionText="Save changes"
        disabled
        variant="primary"
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByText("Save changes"));

    expect(onPress).not.toHaveBeenCalled();
  });
});
