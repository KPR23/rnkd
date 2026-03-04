"use client";

import { trpc } from "../trpc/client";

export default function Home() {
	const { data: users } = trpc.getUsers.useQuery();

	return (
		<div style={{ padding: "20px" }}>
			<div style={{ marginTop: "20px" }}>
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
						<strong>{user.name}</strong> - {user.email} (Age: {user.age})
					</div>
				))}
			</div>
		</div>
	);
}
