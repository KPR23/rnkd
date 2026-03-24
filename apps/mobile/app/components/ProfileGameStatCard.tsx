import { View } from "react-native";
import Text from "./Text";
import RankEmblem from "./Riot/RankEmblems";
import type { GameAccount } from "@repo/types";
import { trpc } from "@/utils/trpc";

const QUEUE_LABELS: Record<string, string> = {
	RANKED_SOLO_5x5: "Ranked Solo/Duo",
	RANKED_FLEX_SR: "Ranked Flex",
};

function formatRankTitle(tier: string, rank: string | null) {
	const t = tier.charAt(0) + tier.slice(1).toLowerCase();
	if (!rank) {
		return t;
	}
	return `${t} ${rank}`;
}

function riotTierToEmblemTier(tier: string | undefined): string {
	if (!tier) {
		return "gold";
	}
	const lower = tier.toLowerCase();
	const keys = [
		"iron",
		"bronze",
		"silver",
		"gold",
		"platinum",
		"emerald",
		"diamond",
		"master",
		"grandmaster",
		"challenger",
	];
	return keys.includes(lower) ? lower : "gold";
}

type ProfileGameStatCardProps = {
	gameAccount: GameAccount;
};

export default function ProfileGameStatCard({
	gameAccount,
}: ProfileGameStatCardProps) {
	const { data, isLoading } = trpc.gameAccount.getLolProfileDisplay.useQuery(
		{ gameAccountId: gameAccount.id },
		{ enabled: gameAccount.gameId === "lol" },
	);

	const ranked = data?.ranked;
	const rankedWinRate = data?.rankedWinRate ?? 0;

	const wlLine =
		ranked != null
			? `${ranked.wins}W ${ranked.losses}L`
			: isLoading
				? "…"
				: "—";
	const rankedWrLine =
		ranked != null ? `${rankedWinRate.toFixed(0)}%` : isLoading ? "…" : "—";

	const gamesVal = "-";
	const kdaVal = "-";
	const csPerMinVal = "-";

	return (
		<View className="w-full flex flex-col">
			<View className="w-full min-h-16 text-text pl-3 pr-4 py-2 flex-row gap-5 items-center justify-between">
				<View className="flex-row gap-3 items-center flex-1 min-w-0">
					<View className="w-12 h-12 flex items-center justify-center shrink-0">
						<RankEmblem tier={riotTierToEmblemTier(ranked?.tier)} />
					</View>
					<View className="flex-col items-start flex-1 -gap-2">
						<Text
							className="text-base font-sans-semibold text-text"
							numberOfLines={1}
						>
							<Text
								className="text-base font-sans-semibold text-text"
								numberOfLines={1}
							>
								{formatRankTitle(
									ranked?.tier ?? "Unranked",
									ranked?.rank ?? "",
								)}
								{ranked != null && (
									<Text className="text-text-secondary font-sans-semibold">
										{" "}
										({ranked.leaguePoints} LP)
									</Text>
								)}
							</Text>
						</Text>
						<Text
							className="font-mono-semibold text-text-secondary uppercase text-xs"
							numberOfLines={1}
						>
							{QUEUE_LABELS[ranked?.queueType ?? ""] ?? "Ranked"}
						</Text>
					</View>
				</View>
				<View className="flex-col gap-0.5 justify-center items-end shrink-0">
					<Text className="text-xs font-mono-medium leading-none text-text">
						{wlLine}
					</Text>
					<Text className="text-xs font-mono-semibold leading-none text-text-secondary">
						{rankedWrLine}
						<Text
							className="text-text-secondary font-sans-medium text-xs"
							style={{ letterSpacing: -0.35 }}
						>
							{" "}
							WR
						</Text>
					</Text>
				</View>
			</View>
			<View className="w-full h-12 flex flex-row items-center justify-between border-t border-border">
				<View className="flex-1 items-center justify-center border-r h-full border-border">
					<StatItem value={gamesVal} label="last 20 games" />
				</View>
				<View className="flex-1 items-center justify-center border-r h-full border-border">
					<StatItem value={kdaVal} label="avg kda" />
				</View>
				<View className="flex-1 w-full items-center justify-center h-full">
					<StatItem value={csPerMinVal} label="avg cs/min" />
				</View>
			</View>
		</View>
	);
}

const StatItem = ({ value, label }: { value: string; label: string }) => {
	return (
		<View className="flex-col items-center justify-center -gap-1">
			<Text className="font-mono-bold text-text text-sm text-center leading-none">
				{value}
			</Text>
			<Text className="font-sans-medium uppercase text-text-secondary text-xs text-center leading-none">
				{label}
			</Text>
		</View>
	);
};
