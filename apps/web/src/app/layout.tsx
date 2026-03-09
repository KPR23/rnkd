import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { TRPCProvider } from "../trpc/provider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
});

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
				jetbrainsMono.variable,
				"font-sans",
				geist.variable,
			)}
		>
			<body
				className={`${geistSans.variable} ${geistMono.variable}`}
				suppressHydrationWarning
			>
				<TRPCProvider>{children}</TRPCProvider>
			</body>
		</html>
	);
}
