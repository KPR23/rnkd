import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@repo/api";
import { auth } from "../../../../lib/auth";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: async () => {
			const session = await auth.api.getSession({
				headers: req.headers,
			});

			return createTRPCContext({
				session: session ?? null,
			});
		},
	});

export { handler as GET, handler as POST };
