import { db, user } from "@repo/db";
import { ilike } from "drizzle-orm";

export async function searchUsers(query: string) {
	const safeQuery = query.replace(/[%_]/g, "");
	const results = await db.query.user.findMany({
		where: ilike(user.name, `${safeQuery}%`),
		limit: 20,
	});

	return results;
}
