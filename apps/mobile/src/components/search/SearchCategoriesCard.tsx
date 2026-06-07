import { Text, TouchableOpacity } from "react-native";

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
  const activeColor = selected && name === "All" ? colors.text : color;

  const iconContext = {
    size: 20,
    color: selected ? activeColor : color,
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
            : { backgroundColor: colors.card, borderColor: colors.muted }
        }
        onPress={onPress}
      >
        {icon}
        <Text
          className="font-sans-medium text-sm"
          style={{ color: selected ? activeColor : colors.textSecondary }}
        >
          {name}
        </Text>
      </TouchableOpacity>
    </IconContext.Provider>
  );
}
