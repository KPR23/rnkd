import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TRPCProvider } from "../trpc/provider";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
			className={cn("font-sans dark", jetbrainsMono.variable, "font-sans", geist.variable)}
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
