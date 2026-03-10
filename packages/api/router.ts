import { gameAccountRouter } from "./src/routers/gameAccount";
import { riotRouter } from "./src/routers/riot";
import { userRouter } from "./src/routers/user";
import { router } from "./src/trpc";

export const appRouter = router({
	user: userRouter,
	game: router({}),
	gameAccount: gameAccountRouter,
	riot: riotRouter,
	match: router({}),
	league: router({}),
	follow: router({}),
});

export type AppRouter = typeof appRouter;
