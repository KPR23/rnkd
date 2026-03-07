import type { RiotRegion } from "./riot-regions";

export const ADD_LOL_ACCOUNT_FIELDS = [
	{
		key: "gameName" as const,
		placeholder: "Game name",
		label: "Game name",
	},
	{
		key: "tagLine" as const,
		placeholder: "Tag line",
		label: "Tag line",
	},
	{
		key: "region" as const,
		placeholder: "Region",
		label: "Region",
	},
] as const;

export type AddLolAccountInput = {
	gameName: string;
	tagLine: string;
	region: RiotRegion;
};

export type AddLolAccountFieldKey =
	(typeof ADD_LOL_ACCOUNT_FIELDS)[number]["key"];

export const ADD_FACEIT_ACCOUNT_FIELDS = [
	{
		key: "externalId" as const,
		placeholder: "Faceit nickname",
		label: "Faceit nickname",
	},
] as const;

export type AddFaceitAccountInput = {
	externalId: string;
};

export type AddFaceitAccountFieldKey =
	(typeof ADD_FACEIT_ACCOUNT_FIELDS)[number]["key"];
