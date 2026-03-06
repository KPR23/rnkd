import type { auth } from "../../../apps/web/src/lib/auth";

export type AuthSession = typeof auth.$Infer.Session;

export type User = AuthSession["user"];
export type Session = AuthSession["session"];

export type BetterAuthUser = User;
export type BetterAuthSessionMeta = Session;
export type BetterAuthSession = AuthSession;

