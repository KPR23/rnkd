import { useEffect } from "react";
import { useState } from "react";
import type { AddGameAccountInput } from "./add-game-account-fields";

export type AddGameAccountMutation = {
	mutate: (input: AddGameAccountInput) => void;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: { message: string } | null;
};

export function useAddGameAccountForm(mutation: AddGameAccountMutation) {
	const [gameId, setGameId] = useState("");
	const [externalId, setExternalId] = useState("");
	const [nickname, setNickname] = useState("");
	const [region, setRegion] = useState("");

	const reset = () => {
		setGameId("");
		setExternalId("");
		setNickname("");
		setRegion("");
	};

	useEffect(() => {
		if (mutation.isSuccess) {
			reset();
		}
	}, [mutation.isSuccess]);

	const handleSubmit = () => {
		mutation.mutate({ gameId, externalId, nickname, region });
	};

	const values = { gameId, externalId, nickname, region };
	const setters = { setGameId, setExternalId, setNickname, setRegion };

	return {
		...values,
		...setters,
		handleSubmit,
		reset,
		isPending: mutation.isPending,
		isSuccess: mutation.isSuccess,
		isError: mutation.isError,
		error: mutation.error,
	};
}
