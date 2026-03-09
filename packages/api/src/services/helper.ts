import { db, follows } from "@repo/db";
import { eq } from "drizzle-orm";

export async function getFollowedAccounts(userId: string) {
	const followedAccounts = await db.query.follows.findMany({
		where: eq(follows.followerUserId, userId),
	});

	return followedAccounts;
}
