import { Pressable, PressableProps } from "react-native";

type Props = PressableProps & {
	icon: React.ReactNode;
	size?: number;
	className?: string;
};

const DEFAULT_SIZE = 36;

export default function IconButton({
	icon,
	size = DEFAULT_SIZE,
	className = "",
	...pressableProps
}: Props) {
	return (
		<Pressable
			{...pressableProps}
			className={`will-change-pressable items-center justify-center border border-dark active:opacity-70 ${className}`}
			style={[{ width: size, height: size }]}
		>
			{icon}
		</Pressable>
	);
}
