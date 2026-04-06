import { db, user } from "@repo/db";
import { ilike, or } from "drizzle-orm";

function normalizeSearchQuery(query: string) {
	return query.trim().replace(/[%_]/g, "");
}

export async function searchUsers(query: string) {
	const safeQuery = normalizeSearchQuery(query);

	if (!safeQuery) {
		return [];
	}

	const results = await Promise.all([
		searchUsersByNameOrTag(query),
		searchUsersByTag(query),
	]);

	return results;
}

export async function searchUsersByNameOrTag(query: string) {
	const safeQuery = normalizeSearchQuery(query);

	if (!safeQuery) {
		return [];
	}

	const searchPatterns = [`${safeQuery}%`, `% ${safeQuery}%`];
	const searchColumns = [user.name, user.tag];

	const results = await db.query.user.findMany({
		where: or(
			...searchColumns.flatMap((column) =>
				searchPatterns.map((pattern) => ilike(column, pattern)),
			),
		),
		limit: 20,
	});

	return results;
}

export async function searchUsersByTag(query: string) {
	const safeQuery = normalizeSearchQuery(query);

	if (!safeQuery) {
		return [];
	}

	const results = await db.query.user.findMany({
		where: ilike(user.tag, `${safeQuery}%`),
		limit: 20,
	});

	return results;
}
