import { Text, View } from "react-native";
import RankEmblem from "./Riot/RankEmblems";

function formatRankTitle(tier: string, rank: string | null) {
	const t = tier.charAt(0) + tier.slice(1).toLowerCase();
	if (!rank) {
		return t;
	}
	return `${t} ${rank}`;
}

function riotTierToEmblemTier(tier: string | undefined): string {
	if (!tier) {
		return "unranked";
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
	return keys.includes(lower) ? lower : "unranked";
}

export type RankDisplayRanked = {
	tier?: string;
	rank?: string | null;
	leaguePoints?: number;
	wins?: number;
	losses?: number;
} | null;

type RankDisplayCardProps = {
	ranked?: RankDisplayRanked;
	accountLabel: string;
	winRateLine: string;
};

export default function RankDisplayCard({
	ranked,
	accountLabel,
	winRateLine,
}: RankDisplayCardProps) {
	return (
		<View className="w-full flex items-center flex-row border-border bg-card border px-4 py-2 h-16 justify-between">
			<View className="flex flex-row items-center gap-3 flex-1">
				<View className="w-12 h-12 flex items-center justify-center shrink-0 ">
					<RankEmblem tier={riotTierToEmblemTier(ranked?.tier)} />
				</View>
				<View className="flex-col w-full flex-1">
					<View className="flex flex-row w-full items-center justify-between gap-1">
						<View className="flex flex-row items-center gap-1">
							{ranked?.tier ? (
								<>
									<Text className="text-base font-sans-semibold text-text">
										{formatRankTitle(
											ranked.tier ?? "Unranked",
											ranked.rank ?? "",
										)}{" "}
									</Text>
									<Text className="font-sans-semibold text-text-muted text-base">
										{ranked.leaguePoints} LP
									</Text>
								</>
							) : (
								<Text className="text-base font-sans-semibold text-text">
									Unranked
								</Text>
							)}
						</View>
						<View className="flex flex-row items-center gap-1">
							<Text className="font-mono-medium text-text uppercase text-xs">
								{ranked?.wins ?? 0}
								<Text className="font-sans-medium text-text uppercase text-xs">
									W
								</Text>
							</Text>
							<Text className="font-mono-medium text-text uppercase text-xs">
								{ranked?.losses ?? 0}
								<Text className="font-sans-medium text-text uppercase text-xs">
									L
								</Text>
							</Text>
						</View>
					</View>
					<View className="flex flex-row w-full items-center justify-between gap-1">
						<Text className="font-sans-medium text-text-secondary text-xs">
							{accountLabel}
						</Text>
						<View className="flex flex-row items-center gap-1">
							<Text className="font-mono-semibold text-text-muted uppercase text-xs">
								{winRateLine}
							</Text>
							<Text className="font-sans-medium text-text-muted uppercase text-xs">
								WR
							</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}
