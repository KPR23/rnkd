"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./home-client"), {
	ssr: false,
	loading: () => <div style={{ padding: "20px" }}>Loading...</div>,
});

export default function Home() {
	return <HomeClient />;
}
