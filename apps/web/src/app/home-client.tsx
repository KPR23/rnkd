"use client";

import { signInWithGithub, useSession } from "../lib/auth-client";
import { trpc } from "../trpc/client";
import {
	ADD_GAME_ACCOUNT_FIELDS,
	useAddGameAccountForm,
} from "@repo/forms";

function AddGameAccountForm() {
	const addAccount = trpc.gameAccount.addGameAccount.useMutation();
	const form = useAddGameAccountForm(addAccount);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		form.handleSubmit();
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "12px",
				maxWidth: "320px",
				marginTop: "24px",
				padding: "16px",
				border: "1px solid #e5e7eb",
				borderRadius: "8px",
				backgroundColor: "#f9fafb",
			}}
		>
			<h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
				Dodaj konto gry
			</h3>
			{(ADD_GAME_ACCOUNT_FIELDS as readonly { key: string; placeholder: string }[]).map((field) => (
				<input
					key={field.key}
					placeholder={field.placeholder}
					value={form[field.key]}
					onChange={(e) => {
						const setter = form[`set${field.key.charAt(0).toUpperCase()}${field.key.slice(1)}` as keyof typeof form];
						if (typeof setter === "function") setter(e.target.value);
					}}
					required
					style={{
						padding: "8px 12px",
						borderRadius: "6px",
						border: "1px solid #d1d5db",
					}}
				/>
			))}
			<button
				type="submit"
				disabled={form.isPending}
				style={{
					padding: "10px 16px",
					backgroundColor: "#2563eb",
					color: "white",
					border: "none",
					borderRadius: "6px",
					cursor: form.isPending ? "not-allowed" : "pointer",
					fontWeight: 500,
				}}
			>
				{form.isPending ? "Zapisywanie…" : "Dodaj konto"}
			</button>
			{form.isSuccess && (
				<p style={{ margin: 0, color: "#059669", fontSize: "14px" }}>
					Konto dodane.
				</p>
			)}
			{form.isError && form.error && (
				<p style={{ margin: 0, color: "#dc2626", fontSize: "14px" }}>
					{form.error.message}
				</p>
			)}
		</form>
	);
}

export default function HomeClient() {
	const { data: session, isPending } = useSession();
	const user = trpc.user.getCurrentUser.useQuery();

	if (isPending) {
		return <div>Loading...</div>;
	}

	if (!session) {
		return (
			<div style={{ padding: "20px" }}>
				<p>You must be signed in to view this page.</p>
				<button onClick={signInWithGithub}>Sign in with Github</button>
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ marginTop: "20px" }}>
				<p>Signed in as {session.user.email}</p>
				<p>Signed in as {user.data?.name}</p>
			</div>
			<AddGameAccountForm />
		</div>
	);
}
