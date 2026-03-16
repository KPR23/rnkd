import { cn } from "@/src/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCProvider } from "../trpc/provider";
import "./globals.css";
import { Toaster } from "@repo/ui/sonner";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "Rnkd",
	description: "One profile to rule them all",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"font-sans dark",
				geistMono.variable,
				"font-sans",
				geist.variable,
			)}
		>
			<body suppressHydrationWarning>
				<TRPCProvider>
					{children}
					<Toaster />
				</TRPCProvider>
			</body>
		</html>
	);
}
