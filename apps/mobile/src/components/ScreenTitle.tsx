import { Text, View } from "react-native";

import { IconContext } from "phosphor-react-native";

import IconButton from "./IconButton";

const titleActionIconContext = {
  size: 22,
  color: "white",
};

export type ScreenTitleAction = {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
};

type Props = {
  title: string;
  actions?: ScreenTitleAction[];
};

export default function ScreenTitle({ title, actions }: Props) {
  return (
    <View className="my-4 flex-row items-center justify-between">
      <Text className="font-sans-bold text-text text-2xl">{title}</Text>
      {actions && actions.length > 0 && (
        <IconContext.Provider value={titleActionIconContext}>
          <View className="flex-row items-center gap-3">
            {actions.map((action, index) => (
              <IconButton
                key={index}
                icon={action.icon}
                onPress={action.onPress}
                accessibilityLabel={action.accessibilityLabel}
              />
            ))}
          </View>
        </IconContext.Provider>
      )}
    </View>
  );
}
