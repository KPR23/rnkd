import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@repo/api";
import { auth } from "../../../../lib/auth";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () => {
			const authHeader = req.headers.get("authorization");

			if (authHeader?.startsWith("Bearer ")) {
				const token = authHeader.slice("Bearer ".length).trim();
				const headers = new Headers();
				headers.set("cookie", `better-auth.session_token=${token}`);

				const sessionFromToken = await auth.api.getSession({ headers });

				return createTRPCContext({
					session: sessionFromToken ?? null,
				});
			}

			const sessionFromCookies = await auth.api.getSession({
				headers: req.headers,
			});

			return createTRPCContext({
				session: sessionFromCookies ?? null,
			});
		},
	});

export { handler as GET, handler as POST };
