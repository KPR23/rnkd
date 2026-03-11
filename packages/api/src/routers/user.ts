import { db, gameAccounts, GAMES } from "@repo/db";
import { eq } from "drizzle-orm";
import { getLolAccountDetails } from "../services/riot/riot";
import type { RiotPlatformRoute } from "../services/riot/types";
import { protectedProcedure, router } from "../trpc";

function refreshLolProfileInBackground(
	accountId: string,
	externalId: string,
	platformRoute: RiotPlatformRoute,
) {
	getLolAccountDetails(externalId, platformRoute)
		.then(async (details) => {
			await db
				.update(gameAccounts)
				.set({
					profileIconId: details.profileIconId,
					summonerLevel: details.summonerLevel,
				})
				.where(eq(gameAccounts.id, accountId));
		})
		.catch((error) => {
			console.error(error);
		});
}

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

		// const faceitAccounts = accounts.filter(
		// 	(a) => a.gameId === GAMES.CS2_FACEIT,
		// );

		for (const a of lolAccounts) {
			refreshLolProfileInBackground(
				a.id,
				a.externalId,
				a.platformRoute as RiotPlatformRoute,
			);
		}

		return {
			lol: lolAccounts,
		};
	}),
});
