"use client";

import dynamic from "next/dynamic";

const HomeClient = dynamic(() => import("./home-client"), {
	ssr: false,
	loading: () => (
		<div className="p-5">
			<p className="text-sm text-gray-600">Loading…</p>
		</div>
	),
});

export default function Home() {
	return <HomeClient />;
}
