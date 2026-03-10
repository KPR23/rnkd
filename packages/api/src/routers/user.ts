import { db, gameAccounts, GAMES } from "@repo/db";
import { eq } from "drizzle-orm";
import { getLolAccountDetails } from "../services/riot/riot";
import type { RiotPlatformRoute } from "../services/riot/types";
import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
	getCurrentUser: protectedProcedure.query(({ ctx }) => {
		return ctx.session.user;
	}),
	getGameAccounts: protectedProcedure.query(async ({ ctx }) => {
		const accounts = await db.query.gameAccounts.findMany({
			where: eq(gameAccounts.userId, ctx.session.user.id),
		});

		const lolAccounts = accounts.filter(
			(a) => a.gameId === GAMES.LOL && a.regionalRoute && a.platformRoute,
		);
		const faceitAccounts = accounts.filter(
			(a) => a.gameId === GAMES.CS2_FACEIT,
		);

		const lolWithDetails = await Promise.all(
			lolAccounts.map(async (account) => {
				const details = await getLolAccountDetails(
					account.externalId,
					account.platformRoute as RiotPlatformRoute,
				);
				return { account, details };
			}),
		);

		return {
			lol: lolWithDetails,
			faceit: faceitAccounts.map((account) => ({ account })),
		};
	}),
});
