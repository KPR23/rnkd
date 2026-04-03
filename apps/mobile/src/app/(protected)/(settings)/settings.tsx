import Button from "@/src/components/Button";
import UserHeader from "@/src/components/UserHeader";
import { APP_VERSION } from "@/src/lib/constants/app-version";
import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import Frame from "@/src/components/Frame";
import {
	BellIcon,
	LinkIcon,
	SignOutIcon,
	UserIcon,
} from "phosphor-react-native";
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

	const settingsSections = [
		{
			title: "Account details",
			items: [
				{
					title: "Personal information",
					icon: <UserIcon />,
					onPress: () => void 0,
				},
				{
					title: "Linked accounts",
					icon: <LinkIcon />,
					onPress: () => void 0,
				},
			],
		},
		{
			title: "Preferences",
			items: [
				{
					title: "Notifications",
					icon: <BellIcon />,
					onPress: () => void 0,
				},
			],
		},
	];

	return (
		<View className="p-5 flex flex-col gap-4">
			<UserHeader user={session.user} />
			<Button
				variant="destructive"
				actionText="Sign out"
				icon={<SignOutIcon />}
				className="w-full"
				onPress={handleSignOut}
			/>
			<View className="flex flex-col gap-4">
				{settingsSections.map((section) => (
					<View key={section.title} className="flex flex-col gap-2">
						<Text className="font-sans-semibold text-xs text-text uppercase">
							{section.title}
						</Text>

						{section.items.map((item) => (
							<SettingsCard
								key={item.title}
								title={item.title}
								icon={item.icon}
								onPress={item.onPress}
							/>
						))}
					</View>
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
