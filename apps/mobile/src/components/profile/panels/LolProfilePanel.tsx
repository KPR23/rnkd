import { type GameProfilePanelProps } from "@/src/components/GameProfileRegistry";
import ProfileGameStatCard from "@/src/components/ProfileGameStatCard";

export default function LolProfilePanel({
	gameAccount,
}: GameProfilePanelProps) {
	return <ProfileGameStatCard gameAccount={gameAccount} />;
}
