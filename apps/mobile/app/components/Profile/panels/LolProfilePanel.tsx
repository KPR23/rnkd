import type { GameProfilePanelProps } from "@/profile/GameProfileRegistry";
import ProfileGameStatCard from "@/app/components/ProfileGameStatCard";

export default function LolProfilePanel({
	gameAccount,
}: GameProfilePanelProps) {
	return <ProfileGameStatCard gameAccount={gameAccount} />;
}
