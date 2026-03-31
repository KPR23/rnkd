import { Text, View } from "react-native";
import RankDisplayCard from "./RankDisplayCard";
import { isLolGameAccount, type GameAccount } from "@repo/types";
import { trpc } from "@/utils/trpc";

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

	const accountLabel =
		isLolAccount &&
		data?.gameAccount.profile?.gameName &&
		data?.gameAccount.profile?.tagLine
			? `${data.gameAccount.profile.gameName} #${data.gameAccount.profile.tagLine}`
			: gameAccount.externalId.slice(0, 10);

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
				<RankDisplayCard
					ranked={ranked}
					accountLabel={accountLabel}
					winRateLine={rankedWrLine}
				/>
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
