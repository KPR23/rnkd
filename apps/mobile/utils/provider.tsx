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
					headers() {
						const headers = new Map<string, string>();
						const cookies = authClient.getCookie();

						if (cookies) {
							headers.set("Cookie", cookies);
						}

						return Object.fromEntries(headers);
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
