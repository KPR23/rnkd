import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { IconContext } from "phosphor-react-native";

import { colors } from "@repo/ui/colors";

interface SearchCategoriesCardProps {
  name: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  selected: boolean;
}

export default function SearchCategoriesCard({
  name,
  icon,
  color,
  onPress,
  selected,
}: SearchCategoriesCardProps) {
  const iconContext = {
    size: 20,
    color: color,
    weight: "regular" as const,
  };

  return (
    <IconContext.Provider value={iconContext}>
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex h-10 w-full flex-row items-center gap-1.5 border px-2.5"
        style={
          selected
            ? {
                borderColor: color,
                backgroundColor: `${color}1A`,
              }
            : { borderColor: colors.border }
        }
        onPress={onPress}
      >
        {icon}
        <Text
          className={`font-sans-medium text-sm ${selected ? "text-text" : "text-text-secondary"}`}
        >
          {name}
        </Text>
      </TouchableOpacity>
    </IconContext.Provider>
  );
}
