"use client";

import { useEffect, useState } from "react";
import type { AddLolAccountInput } from "./add-game-account-fields";
import type { RiotRegion } from "./riot-regions";

export type { AddLolAccountInput };

export type AddLolAccountMutation = {
	mutate: (input: AddLolAccountInput) => void;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: { message: string } | null;
};

export function useAddLolAccountForm(mutation: AddLolAccountMutation) {
	const [gameName, setGameName] = useState("");
	const [tagLine, setTagLine] = useState("");
	const [region, setRegion] = useState<RiotRegion>("europe");

	const reset = () => {
		setGameName("");
		setTagLine("");
		setRegion("europe");
	};

	useEffect(() => {
		if (mutation.isSuccess) {
			reset();
		}
	}, [mutation.isSuccess]);

	const handleSubmit = (override?: AddLolAccountInput) => {
		const payload: AddLolAccountInput =
			override ?? {
				gameName: gameName.trim(),
				tagLine: tagLine.trim(),
				region,
			};

		mutation.mutate({
			gameName: payload.gameName.trim(),
			tagLine: payload.tagLine.trim(),
			region: payload.region,
		});
	};

	const isValid =
		gameName.trim().length >= 3 &&
		gameName.trim().length <= 16 &&
		tagLine.trim().length >= 3 &&
		tagLine.trim().length <= 5;

	return {
		gameName,
		setGameName,
		tagLine,
		setTagLine,
		region,
		setRegion,
		handleSubmit,
		reset,
		isValid,
		isPending: mutation.isPending,
		isSuccess: mutation.isSuccess,
		isError: mutation.isError,
		error: mutation.error,
	};
}
