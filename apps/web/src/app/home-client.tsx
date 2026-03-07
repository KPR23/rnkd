"use client";

import {
	useAddLolAccountForm,
	useAddFaceitAccountForm,
	RIOT_REGIONS,
	RIOT_REGION_LABELS,
	RiotDetailsTester,
} from "@repo/forms";
import { signInWithGithub, useSession } from "../lib/auth-client";
import { trpc } from "../trpc/client";

const formStyle = {
	display: "flex",
	flexDirection: "column" as const,
	gap: "12px",
	maxWidth: "320px",
	marginTop: "24px",
	padding: "16px",
	border: "1px solid #e5e7eb",
	borderRadius: "8px",
	backgroundColor: "#f9fafb",
};

const inputStyle = {
	padding: "8px 12px",
	borderRadius: "6px",
	border: "1px solid #d1d5db",
};

function AddLolAccountForm() {
	const addLol = trpc.gameAccount.addLolAccount.useMutation();
	const form = useAddLolAccountForm(addLol);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.isValid) return;
		form.handleSubmit();
	};

	return (
		<form onSubmit={handleSubmit} style={formStyle}>
			<h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
				Add League of Legends account
			</h3>
			<input
				placeholder="Game name (e.g. PlayerName)"
				value={form.gameName}
				onChange={(e) => form.setGameName(e.target.value)}
				required
				minLength={3}
				maxLength={16}
				style={inputStyle}
			/>
			<input
				placeholder="Tag line (e.g. EUW1)"
				value={form.tagLine}
				onChange={(e) => form.setTagLine(e.target.value)}
				required
				minLength={3}
				maxLength={5}
				style={inputStyle}
			/>
			<label style={{ fontSize: "14px", color: "#374151" }}>Region</label>
			<select
				value={form.region}
				onChange={(e) =>
					form.setRegion(e.target.value as (typeof RIOT_REGIONS)[number])
				}
				required
				style={inputStyle}
			>
				{RIOT_REGIONS.map((r) => (
					<option key={r} value={r}>
						{RIOT_REGION_LABELS[r]}
					</option>
				))}
			</select>
			<button
				type="submit"
				disabled={form.isPending || !form.isValid}
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
				{form.isPending ? "Saving…" : "Add LoL account"}
			</button>
			{form.isSuccess && (
				<p style={{ margin: 0, color: "#059669", fontSize: "14px" }}>
					LoL account added.
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

function AddFaceitAccountForm() {
	const addFaceit = trpc.gameAccount.addFaceitAccount.useMutation();
	const form = useAddFaceitAccountForm(addFaceit);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.isValid) return;
		form.handleSubmit();
	};

	return (
		<form onSubmit={handleSubmit} style={formStyle}>
			<h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
				Add CS2 Faceit account
			</h3>
			<input
				placeholder="Faceit ID (e.g. from faceit.com)"
				value={form.externalId}
				onChange={(e) => form.setExternalId(e.target.value)}
				required
				style={inputStyle}
			/>
			<button
				type="submit"
				disabled={form.isPending || !form.isValid}
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
				{form.isPending ? "Saving…" : "Add Faceit account"}
			</button>
			{form.isSuccess && (
				<p style={{ margin: 0, color: "#059669", fontSize: "14px" }}>
					Faceit account added.
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

function RiotDetailsDemoSection() {
	const demoQuery = trpc.gameAccount.getLolDetailsDemo.useQuery(undefined, {
		enabled: false,
	});
	const fetchRiotDetails = async () => {
		const { data } = await demoQuery.refetch();
		return data;
	};
	return <RiotDetailsTester fetchRiotDetails={fetchRiotDetails} />;
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
				<button onClick={signInWithGithub}>Sign in with GitHub</button>
			</div>
		);
	}

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ marginTop: "20px" }}>
				<p>Signed in as {session.user.email}</p>
				<p>Signed in as {user.data?.name}</p>
			</div>
			<RiotDetailsDemoSection />
			<AddLolAccountForm />
			<AddFaceitAccountForm />
		</div>
	);
}
