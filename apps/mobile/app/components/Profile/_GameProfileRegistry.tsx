import type { GameAccount, GameId } from "@repo/types";
import type { ComponentType } from "react";
import { GAMES } from "../../../../../packages/db/src/schema";
import Cs2FaceitProfilePanel from "./panels/Cs2FaceitProfilePanel";
import LolProfilePanel from "./panels/LolProfilePanel";
import DefaultGamePanel from "./panels/DefaultGamePanel";

export type GameProfilePanelProps = {
	gameAccount: GameAccount;
};

export const GAME_PROFILE_PANELS: Partial<
	Record<GameId, ComponentType<GameProfilePanelProps>>
> = {
	[GAMES.LOL]: LolProfilePanel,
	[GAMES.CS2_FACEIT]: Cs2FaceitProfilePanel,
};

export function getProfilePanelForGame(
	gameId: string,
): ComponentType<GameProfilePanelProps> {
	const panel = GAME_PROFILE_PANELS[gameId as GameId];
	return panel ?? DefaultGamePanel;
}
