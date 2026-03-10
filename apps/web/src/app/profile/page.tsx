"use client";

import dynamic from "next/dynamic";
import { ListMatchHistory } from "./_components/listMatchHistory";
import { useSession } from "@/src/lib/auth-client";

function ProfilePageImpl() {
	const { data: session } = useSession();

	if (!session) {
		return <div>You must be signed in to view this page.</div>;
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md flex flex-col gap-4">
				<ListMatchHistory />
			</div>
		</div>
	);
}

const ProfilePage = dynamic(() => Promise.resolve(ProfilePageImpl), {
	ssr: false,
});

export default ProfilePage;
