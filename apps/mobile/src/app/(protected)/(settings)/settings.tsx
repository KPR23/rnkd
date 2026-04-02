import Button from "@/src/components/Button";
import UserHeader from "@/src/components/UserHeader";
import { APP_VERSION } from "@/src/lib/constants/app-version";
import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import Frame from "@/src/components/Frame";
import { UserIcon } from "phosphor-react-native";
import SettingsCard from "@/src/app/(protected)/(settings)/SettingsCard";

export default function SettingsScreen() {
	const router = useRouter();
	const { data: session, isPending } = useAuth();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.replace("/(auth)/sign-in");
	};

	if (isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator />
			</View>
		);
	}

	if (!session?.user) {
		return null;
	}

	const settingsCards = [
		{
			title: "Personal information",
			icon: <UserIcon />,
			onPress: () => void 0,
		},
	];

	return (
		<View className="p-5 flex flex-col gap-4">
			<UserHeader user={session.user} />
			<Button
				variant="secondary"
				actionText="Sign out"
				className="w-full"
				onPress={handleSignOut}
			/>
			<View className="flex flex-col gap-4">
				<Text className="font-sans-semibold text-xs text-text uppercase">
					Account details
				</Text>
				{settingsCards.map((card) => (
					<SettingsCard
						key={card.title}
						title={card.title}
						icon={card.icon}
						onPress={card.onPress}
					/>
				))}
			</View>
			<View className="items-center">
				<Text className="text-center text-sm text-text-muted">
					Version {APP_VERSION}
				</Text>
				<Text className="text-center text-sm text-text-muted">
					© 2026 KPR's Lab. All rights reserved.
				</Text>
			</View>
		</View>
	);
}
