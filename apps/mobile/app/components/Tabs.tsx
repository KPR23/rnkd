import type { GameAccount } from "@repo/types";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { GAMES } from "../../../../packages/db/src/schema";
import ProfileGameStatCard from "./ProfileGameStatCard";

interface TabsProps {
	gameAccounts: GameAccount[];
}

function getTabLabel(gameId: string) {
	switch (gameId) {
		case "lol":
			return "LOL";
		case "cs2_faceit":
			return "CS2";
		default:
			return gameId.replaceAll("_", " ").toUpperCase();
	}
}

export default function Tabs({ gameAccounts }: TabsProps) {
	const [activeTab, setActiveTab] = useState<string>(
		gameAccounts[0]?.gameId ?? "",
	);

	useEffect(() => {
		if (gameAccounts.length > 0 && !activeTab) {
			const firstGameId = gameAccounts[0]?.gameId;
			if (firstGameId) {
				setActiveTab(firstGameId);
			}
		}
	}, [gameAccounts, activeTab]);

	if (gameAccounts.length === 0) {
		return <Text>No games found</Text>;
	}

	const useHorizontalScroll = gameAccounts.length > 3;

	const tabRow = (
		<View className="flex-row w-full">
			{gameAccounts.map((gameAccount, idx) => {
				const isActive = activeTab === gameAccount.gameId;
				const isLast = idx === gameAccounts.length - 1;
				return (
					<Pressable
						key={gameAccount.id}
						onPress={() => setActiveTab(gameAccount.gameId)}
						className={[
							"relative h-9 items-center justify-center px-6",
							useHorizontalScroll ? "min-w-30" : "flex-1",
							!isLast ? "border-r border-border" : "",
							isActive ? "bg-dark" : "",
						].join(" ")}
						accessibilityRole="tab"
						accessibilityState={{ selected: isActive }}
					>
						<Text
							className={[
								"uppercase text-xs font-mono-semibold",
								isActive ? "text-white" : "text-text-secondary",
							].join(" ")}
						>
							{getTabLabel(gameAccount.gameId)}
						</Text>

						{isActive && (
							<View className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary" />
						)}
					</Pressable>
				);
			})}
		</View>
	);

	return (
		<View className="mt-8 w-full">
			<View className="w-full overflow-hidden border border-border bg-background">
				{useHorizontalScroll ? (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ flexGrow: 1 }}
					>
						{tabRow}
					</ScrollView>
				) : (
					tabRow
				)}
			</View>
			<View className="w-full text-text border-r border-l border-b border-border flex-col gap-5 items-center justify-center">
				{activeTab === GAMES.LOL && <ProfileGameStatCard />}
				{activeTab === GAMES.CS2_FACEIT && (
					<Text className="text-text">CS2</Text>
				)}
			</View>
		</View>
	);
}
