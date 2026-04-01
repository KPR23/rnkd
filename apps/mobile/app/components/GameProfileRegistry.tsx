import { GAMES, type GameAccount, type GameId } from "@repo/types";
import type { ComponentType } from "react";
import Cs2FaceitProfilePanel from "@/app/components/profile/panels/Cs2FaceitProfilePanel";
import DefaultGamePanel from "@/app/components/profile/panels/DefaultGamePanel";
import LolProfilePanel from "@/app/components/profile/panels/LolProfilePanel";

export type GameProfilePanelProps = {
	gameAccount: GameAccount;
};

export const GAME_PROFILE_PANELS: Partial<
	Record<GameId, ComponentType<GameProfilePanelProps>>
> = {
	[GAMES.LOL]: LolProfilePanel,
	[GAMES.CS2_FACEIT]: Cs2FaceitProfilePanel,
};

export default function getProfilePanelForGame(
	gameId: string,
): ComponentType<GameProfilePanelProps> {
	const panel = GAME_PROFILE_PANELS[gameId as GameId];
	return panel ?? DefaultGamePanel;
}
