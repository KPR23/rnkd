import { friendRouter } from "./src/routers/friend";
import { gameRouter } from "./src/routers/game";
import { gameAccountRouter } from "./src/routers/gameAccount";
import { riotRouter } from "./src/routers/riot";
import { searchRouter } from "./src/routers/search";
import { userRouter } from "./src/routers/user";
import { router } from "./src/trpc";

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
