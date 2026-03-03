"use client";

import { trpc } from "../trpc/client";

export default function Home() {
	const { data } = trpc.hello.useQuery({ name: "Kacper" });
	return <h1>{data?.greeting}</h1>;
}
