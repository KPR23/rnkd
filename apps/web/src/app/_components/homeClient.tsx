"use client";

import dynamic from "next/dynamic";

const HomeAuthed = dynamic(
	() => import("./homeAuthed").then((m) => m.HomeAuthed),
	{ ssr: false },
);

export function HomeClient() {
	return <HomeAuthed />;
}


