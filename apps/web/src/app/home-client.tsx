"use client";

import { signInWithGithub, useSession } from "../lib/auth-client";
import { trpc } from "../trpc/client";

export default function HomeClient() {
	const { data: session, isPending } = useSession();
	const user = trpc.getCurrentUser.useQuery();

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
		</div>
	);
}
