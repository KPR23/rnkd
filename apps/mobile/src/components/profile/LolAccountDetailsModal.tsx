import Button from "@/src/components/Button";
import Frame from "@/src/components/Frame";
import LolMatchHistoryCard from "@/src/components/profile/LolMatchHistoryCard";
import RankDisplayCard from "@/src/components/RankDisplayCard";
import { DRAGON_CDN_VERSION } from "@/src/lib/constants/riotApiUrl";
import { trpc } from "@/src/utils/trpc";
import { LolGameAccount } from "@repo/types";
import { Image, Text, View } from "react-native";

function queueWinRateLine(
	ranked: { wins: number; losses: number } | null | undefined,
	isLoading: boolean,
) {
	if (ranked == null) {
		return isLoading ? "…" : "—";
	}
	const played = ranked.wins + ranked.losses;
	if (played === 0) {
		return "—";
	}
	return `${((ranked.wins / played) * 100).toFixed(0)}%`;
}

export default function LolAccountDetailsModal({
	gameAccount,
}: {
	gameAccount: LolGameAccount;
}) {
	const { data, isLoading } = trpc.gameAccount.getLolProfileDisplay.useQuery({
		gameAccountId: gameAccount.id,
	});
	const { data: matchHistory } = trpc.riot.getMatchHistory.useQuery({
		gameAccountId: gameAccount.id,
	});

	const soloWr = queueWinRateLine(data?.rankedSoloDuo, isLoading);
	const flexWr = queueWinRateLine(data?.rankedFlex, isLoading);

	return (
		<View className="flex flex-col gap-4">
			<Frame className="flex flex-col items-start justify-center gap-4!">
				<View className="flex flex-row items-center justify-start gap-3">
					<Image
						source={{
							uri: `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`,
						}}
						className="w-12 h-12"
					/>
					<View className="flex flex-col">
						<View className="flex flex-row gap-1 items-center">
							<Text className="text-text text-xl font-sans-semibold">
								{gameAccount.profile.gameName}
							</Text>
							<Text className="text-text-muted text-lg font-sans-semibold">
								#{gameAccount.profile.tagLine}
							</Text>
						</View>
						<View className="flex flex-row items-center justify-start gap-1">
							<Text className="text-text-muted text-sm font-sans-medium">
								Level {gameAccount.profile.summonerLevel ?? "0"}
							</Text>
							<Text className="text-text-muted text-sm font-sans-medium">
								•
							</Text>
							<Text className="text-text-muted text-sm font-sans-medium">
								{/* TODO: Format regional route */}
								{gameAccount.profile.platformRoute === "eun1"
									? "EUNE"
									: gameAccount.profile.platformRoute}
							</Text>
						</View>
					</View>
				</View>
				<View className="w-full flex-row gap-3">
					<Button
						variant="primary"
						actionText="Refresh"
						className="flex-1 h-9!"
						onPress={() => void 0}
					/>
					<Button
						variant="secondary"
						actionText="Follow account"
						className="flex-1 h-9!"
						onPress={() => void 0}
					/>
				</View>
			</Frame>
			<View className="w-full flex flex-col gap-2">
				<Text className="font-sans-semibold text-[11px] text-text-muted uppercase">
					Ranked
				</Text>
				<View className="flex flex-col gap-2">
					<RankDisplayCard
						ranked={data?.rankedSoloDuo}
						accountLabel="Ranked Solo/Duo"
						winRateLine={soloWr}
					/>
					<RankDisplayCard
						ranked={data?.rankedFlex}
						accountLabel="Ranked Flex"
						winRateLine={flexWr}
					/>
				</View>
			</View>
			<View className="w-full flex flex-col gap-2">
				<Text className="font-sans-semibold text-[11px] text-text-muted uppercase">
					Match history
				</Text>
				<View className="flex flex-col gap-2">
					{matchHistory?.map((match) => (
						<LolMatchHistoryCard key={match.matches.id} matchHistory={match} />
					))}
				</View>
			</View>
		</View>
	);
}
