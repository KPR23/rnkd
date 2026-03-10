import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ListMatchHistory } from "./_components/listMatchHistory";

export default async function ProfilePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	if (!session) {
		redirect("/");
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-md flex flex-col gap-4">
				<ListMatchHistory />
			</div>
		</div>
	);
}
