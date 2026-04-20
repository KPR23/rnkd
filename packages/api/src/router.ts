import { friendRouter } from "./routers/friend";
import { gameRouter } from "./routers/game";
import { gameAccountRouter } from "./routers/gameAccount";
import { riotRouter } from "./routers/riot";
import { searchRouter } from "./routers/search";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  search: searchRouter,
  user: userRouter,
  game: gameRouter,
  gameAccount: gameAccountRouter,
  riot: riotRouter,
  match: router({}),
  league: router({}),
  friend: friendRouter,
});

export type AppRouter = typeof appRouter;
