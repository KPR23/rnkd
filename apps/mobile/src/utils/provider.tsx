import React, { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { authClient } from "@/src/lib/auth/auth-client";
import { queryClient } from "@/src/lib/queryClient";
import { mobileTrpcUrl } from "@/src/lib/server-url";
import { trpc } from "@/src/utils/trpc";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
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
