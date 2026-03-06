import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";
import { mobileTrpcUrl } from "../lib/server-url";
import { authClient } from "../lib/auth-client";
import { trpc } from "./trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: mobileTrpcUrl,
					transformer: superjson,
					async headers() {
						try {
							const { data: session } = await authClient.getSession();
							const token = session?.session.token;

							return token
								? {
										authorization: `Bearer ${token}`,
									}
								: {};
						} catch {
							return {};
						}
					},
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
}
