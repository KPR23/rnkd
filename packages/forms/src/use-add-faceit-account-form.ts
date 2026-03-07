import { useEffect, useState } from "react";
import type { AddFaceitAccountInput } from "./add-game-account-fields";

export type { AddFaceitAccountInput };

export type AddFaceitAccountMutation = {
	mutate: (input: AddFaceitAccountInput) => void;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: { message: string } | null;
};

export function useAddFaceitAccountForm(mutation: AddFaceitAccountMutation) {
	const [externalId, setExternalId] = useState("");

	const reset = () => {
		setExternalId("");
	};

	useEffect(() => {
		if (mutation.isSuccess) {
			reset();
		}
	}, [mutation.isSuccess]);

	const handleSubmit = () => {
		mutation.mutate({ externalId: externalId.trim() });
	};

	const isValid = externalId.trim().length > 0;

	return {
		externalId,
		setExternalId,
		handleSubmit,
		reset,
		isValid,
		isPending: mutation.isPending,
		isSuccess: mutation.isSuccess,
		isError: mutation.isError,
		error: mutation.error,
	};
}
