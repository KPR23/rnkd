"use client";

import { RiotDetailsTester, useAddFaceitAccountForm } from "@repo/forms";
import { authClient, signInWithGithub } from "../lib/auth-client";
import { trpc } from "../trpc/client";

function AddFaceitAccountForm() {
	const addFaceit = trpc.gameAccount.addFaceitAccount.useMutation();
	const form = useAddFaceitAccountForm(addFaceit);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.isValid) return;
		form.handleSubmit();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-8 flex w-full max-w-md flex-col gap-4 border border-black bg-white p-5 shadow-[4px_4px_0_0_#000]"
		>
			<h3 className="border-b border-black pb-2 text-sm font-semibold uppercase tracking-[0.18em] text-black">
				Add CS2 Faceit account
			</h3>
			<input
				placeholder="Faceit ID (e.g. from faceit.com)"
				value={form.externalId}
				onChange={(e) => form.setExternalId(e.target.value)}
				required
				className="border border-black bg-white px-3 py-2 text-xs uppercase tracking-wide text-black outline-none ring-0 placeholder:text-gray-500 focus:bg-black focus:text-white"
			/>
			<button
				type="submit"
				disabled={form.isPending || !form.isValid}
				className="mt-2 border border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[3px_3px_0_0_#000] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_#000] disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-black disabled:shadow-none"
			>
				{form.isPending ? "Saving…" : "Add Faceit account"}
			</button>
			{form.isSuccess && (
				<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-600">
					Faceit account added.
				</p>
			)}
			{form.isError && form.error && (
				<p className="text-[11px] font-medium uppercase tracking-[0.18em] text-red-600">
					{form.error.message}
				</p>
			)}
		</form>
	);
}

function RiotDetailsDemoSection() {
	const utils = trpc.useUtils();
	const fetchRiotDetails = async (puuid: string) => {
		const data = await utils.gameAccount.getLolDetailsDemo.fetch({
			puuid,
		});
		return data;
	};
	return <RiotDetailsTester fetchRiotDetails={fetchRiotDetails} />;
}

export default function HomePage() {
	const { data: session, isPending } = authClient.useSession();
	const user = trpc.user.getCurrentUser.useQuery();

	if (isPending) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center bg-white">
				<p className="border border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[3px_3px_0_0_#000]">
					Loading session…
				</p>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-[60vh] flex-col items-start justify-center gap-4 bg-white p-8">
				<p className="text-xs font-medium uppercase tracking-[0.18em] text-black">
					You must be signed in to view this page.
				</p>
				<button
					onClick={signInWithGithub}
					className="border border-black bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[3px_3px_0_0_#000] transition hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_#000]"
				>
					Sign in with GitHub
				</button>
			</div>
		);
	}

	return (
		<div className="flex min-h-[60vh] flex-col gap-10 bg-white p-8 text-black">
			<div className="space-y-1 border-b border-black pb-4">
				<p className="text-xs font-medium uppercase tracking-[0.18em]">
					Signed in as <span className="font-bold">{session.user.email}</span>
				</p>
				<p className="text-xs font-medium uppercase tracking-[0.18em]">
					Signed in as <span className="font-bold">{user.data?.name}</span>
				</p>
			</div>
			<RiotDetailsDemoSection />
			<div className="flex flex-wrap gap-8">
				<AddFaceitAccountForm />
			</div>
		</div>
	);
}
