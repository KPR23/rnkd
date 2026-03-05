"use client";

import { signInWithGithub, useSession } from "../lib/auth-client";
import { trpc } from "../trpc/client";

function UsersList() {
	const { data: users } = trpc.getUsers.useQuery();

	return (
		<>
			<h2>Users List:</h2>
			{users?.map((user) => (
				<div
					key={user.id}
					style={{
						padding: "8px",
						border: "1px solid #ccc",
						marginBottom: "8px",
						borderRadius: "4px",
					}}
				>
					<strong>{user.name}</strong> - {user.email}
				</div>
			))}
		</>
	);
}

export default function HomeClient() {
	const { data: session, isPending } = useSession();

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
				<UsersList />
			</div>
		</div>
	);
}
