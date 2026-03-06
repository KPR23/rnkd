export const ADD_GAME_ACCOUNT_FIELDS = [
	{
		key: "gameId" as const,
		placeholder: "Game ID (np. UUID z tabeli game)",
		label: "Game ID",
	},
	{
		key: "externalId" as const,
		placeholder: "External ID",
		label: "External ID",
	},
	{
		key: "nickname" as const,
		placeholder: "Nickname",
		label: "Nickname",
	},
	{
		key: "region" as const,
		placeholder: "Region",
		label: "Region",
	},
] as const;

export type AddGameAccountInput = {
	gameId: string;
	externalId: string;
	nickname: string;
	region: string;
};

export type AddGameAccountFieldKey = keyof AddGameAccountInput;
