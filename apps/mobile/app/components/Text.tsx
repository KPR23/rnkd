import { Text as RNText, TextProps } from "react-native";

type Props = TextProps & { className?: string };

export default function Text({ className, ...props }: Props) {
	const hasAnyFontClass = Boolean(className?.match(/(^|\s)font-[^\s]+/));
	const combinedClassName = className
		? `${hasAnyFontClass ? "" : "font-sans "}${className}`
		: "font-sans text-text";
	return <RNText className={combinedClassName} {...props} />;
}
