import { TouchableOpacity, type TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps & {
  icon: React.ReactNode;
  size?: number;
  className?: string;
};

const DEFAULT_SIZE = 36;

export default function IconButton({
  icon,
  size = DEFAULT_SIZE,
  className = "",
  style,
  ...touchableProps
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      {...touchableProps}
      className={`border-border items-center justify-center border ${className}`}
      style={[{ width: size, height: size }, style]}
    >
      {icon}
    </TouchableOpacity>
  );
}
