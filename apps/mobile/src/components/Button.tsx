import { colors } from "@repo/ui/colors";
import { IconContext } from "phosphor-react-native";
import {
	Text,
	TouchableOpacity,
	type TouchableOpacityProps,
} from "react-native";

interface Props extends Pick<TouchableOpacityProps, "onPress" | "disabled"> {
	variant: "primary" | "secondary" | "destructive";
	className?: string;
	actionText: string;
	icon?: React.ReactNode;
	onPress: () => void;
}

export default function Button({
	variant,
	className,
	actionText,
	icon,
	onPress,
	...touchableProps
}: Props) {
	const iconContext = {
		size: 20,
		color: variant === "destructive" ? colors.destructive : colors.gray,
		weight: "bold" as const,
	};

	return (
		<IconContext.Provider value={iconContext}>
			<TouchableOpacity
				activeOpacity={0.7}
				className={`h-11 items-center flex flex-row gap-2 justify-center ${variant === "primary" ? "bg-primary" : variant === "secondary" ? "bg-dark border border-border" : "bg-destructive border border-red-950"} ${className ?? ""}`}
				onPress={onPress}
				{...touchableProps}
			>
				<Text
					className={`${variant === "destructive" ? "text-red-950" : "text-text"} uppercase text-sm`}
					style={{ fontFamily: "JetBrainsMono_600SemiBold" }}
				>
					{actionText}
				</Text>
				{icon && icon}
			</TouchableOpacity>
		</IconContext.Provider>
	);
}
