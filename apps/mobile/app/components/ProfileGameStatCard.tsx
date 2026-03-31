import { View } from "react-native";
import Text from "./Text";
import RankEmblem from "./Riot/RankEmblems";
import { isLolGameAccount, type GameAccount } from "@repo/types";
import { trpc } from "@/utils/trpc";

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

type ProfileGameStatCardProps = {
	gameAccount: GameAccount;
};

export default function ProfileGameStatCard({
	gameAccount,
}: ProfileGameStatCardProps) {
	const isLolAccount = isLolGameAccount(gameAccount);
	const { data, isLoading } = trpc.gameAccount.getLolProfileDisplay.useQuery(
		{ gameAccountId: gameAccount.id },
		{ enabled: isLolAccount },
	);

	const ranked = data?.ranked;
	const rankedWinRate = data?.rankedWinRate ?? 0;

	const rankedWrLine =
		ranked != null ? `${rankedWinRate.toFixed(0)}%` : isLoading ? "…" : "—";

	const recentPerformanceValues: Record<string, string> = {
		"avg kda": "—",
		"avg cs/min": "—",
		"kp%": "—",
	};

	return (
		<View className="w-full flex flex-col px-3 pt-4 pb-3 gap-4">
			<View className="w-full flex flex-col gap-2">
				<Text className="font-sans-semibold text-[11px] text-text-muted uppercase">
					Overview
				</Text>
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
									{isLolAccount &&
									data?.gameAccount.profile?.gameName &&
									data?.gameAccount.profile?.tagLine
										? `${data.gameAccount.profile.gameName} #${data.gameAccount.profile.tagLine}`
										: gameAccount.externalId}
								</Text>
								<View className="flex flex-row items-center gap-1">
									<Text className="font-mono-semibold text-text-muted uppercase text-xs">
										{rankedWrLine}
									</Text>
									<Text className="font-sans-medium text-text-muted uppercase text-xs">
										WR
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			</View>
			<View className="gap-2">
				<Text className="font-sans-semibold text-[11px] text-text-muted uppercase">
					Recent performance · last 20 games
				</Text>
				<StatItem
					values={recentPerformanceValues}
					gameId={gameAccount.gameId}
				/>
			</View>
		</View>
	);
}
{
	/* <View className="">
								
							</View>
							
						</View>
					</View>
					<View className="flex flex-row items-center gap-3 shrink-0 justify-end">
						 */
}

const RECENT_PERFORMANCE_COLUMNS = {
	lol: [
		{ key: "avg kda", label: "Avg KDA" },
		{ key: "avg cs/min", label: "Avg CS/Min" },
		{ key: "kp%", label: "KP%" },
	],
	cs2_faceit: [
		{ key: "avg k/d", label: "Avg K/D" },
		{ key: "avg hs%", label: "Avg HS%" },
		{ key: "adr", label: "ADR" },
	],
} as const;

type RecentPerformanceGameId = keyof typeof RECENT_PERFORMANCE_COLUMNS;

function recentPerformanceColumnsForGame(gameId: string) {
	if (gameId in RECENT_PERFORMANCE_COLUMNS) {
		return RECENT_PERFORMANCE_COLUMNS[gameId as RecentPerformanceGameId];
	}
	return RECENT_PERFORMANCE_COLUMNS.lol;
}

const StatItem = ({
	values,
	gameId,
}: {
	values: Record<string, string>;
	gameId: string;
}) => {
	const columns = recentPerformanceColumnsForGame(gameId);

	return (
		<View className="flex flex-row items-stretch justify-between gap-2">
			{columns.map(({ key, label }) => (
				<StatCell key={key} value={values[key] ?? "—"} label={label} />
			))}
		</View>
	);
};

const StatCell = ({ value, label }: { value: string; label: string }) => (
	<View className="min-w-0 bg-card h-12 flex-1 flex-col items-center justify-center">
		<Text
			className="font-mono-bold text-text text-base text-center leading-none"
			numberOfLines={1}
		>
			{value}
		</Text>
		<Text className="font-sans-medium uppercase text-text-muted text-[11px] text-center">
			{label}
		</Text>
	</View>
);
