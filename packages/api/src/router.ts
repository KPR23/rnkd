import { faceitRouter } from "./routers/faceit";
import { feedRouter } from "./routers/feed";
import { friendRouter } from "./routers/friend";
import { gameRouter } from "./routers/game";
import { gameAccountRouter } from "./routers/gameAccount";
import { groupRouter } from "./routers/group";
import { matchRouter } from "./routers/match";
import { notificationsRouter } from "./routers/notifications";
import { profileRouter } from "./routers/profile";
import { riotRouter } from "./routers/riot";
import { searchRouter } from "./routers/search";
import { userRouter } from "./routers/user";
import { router } from "./trpc";

export const appRouter = router({
  search: searchRouter,
  user: userRouter,
  game: gameRouter,
  gameAccount: gameAccountRouter,
  profile: profileRouter,
  riot: riotRouter,
  faceit: faceitRouter,
  match: matchRouter,
  notifications: notificationsRouter,
  friend: friendRouter,
  group: groupRouter,
  feed: feedRouter,
});

export type AppRouter = typeof appRouter;
