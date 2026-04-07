import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/src/utils/trpc";
import { mobileTrpcUrl } from "@/src/lib/server-url";
import { authClient } from "@/src/lib/auth/auth-client";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient());

	const [trpcClient] = useState(() =>
		trpc.createClient({
			links: [
				httpBatchLink({
					url: mobileTrpcUrl,
					transformer: superjson,
					headers() {
						const cookies = authClient.getCookie();
						return cookies ? { Cookie: cookies } : {};
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
