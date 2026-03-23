import type { GameProfilePanelProps } from "../GameProfileRegistry";
import ProfileGameStatCard from "../../ProfileGameStatCard";

export default function LolProfilePanel({
	gameAccount,
}: GameProfilePanelProps) {
	return <ProfileGameStatCard gameAccount={gameAccount} />;
}
