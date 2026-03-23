import type { GameProfilePanelProps } from "../gameProfileRegistry";
import ProfileGameStatCard from "../../ProfileGameStatCard";

export default function LolProfilePanel({ gameAccount }: GameProfilePanelProps) {
	return <ProfileGameStatCard gameAccount={gameAccount} />;
}
