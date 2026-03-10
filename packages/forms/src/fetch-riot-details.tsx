"use client";

import React, { useState } from "react";
import {
	RIOT_REGIONS,
	RIOT_REGION_LABELS,
	type RiotRegion,
} from "./riot-regions";

export type FetchRiotDetailsFn = (
	puuid: string,
	region: RiotRegion,
) => Promise<unknown>;

type RiotDetailsTesterProps = {
	fetchRiotDetails: FetchRiotDetailsFn;
	title?: string;
};

export function RiotDetailsTester({
	fetchRiotDetails,
	title = "Riot details demo",
}: RiotDetailsTesterProps) {
	const [puuid, setPuuid] = useState("");
	const [region, setRegion] = useState<RiotRegion>("europe");
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<unknown>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!puuid.trim()) return;

		setStatus("loading");
		setError(null);

		try {
			const result = await fetchRiotDetails(puuid.trim(), region);
			setData(result);
			setStatus("success");
		} catch (err) {
			setStatus("error");
			setData(null);
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Unknown error");
			}
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "12px",
				maxWidth: "480px",
				marginTop: "24px",
				padding: "16px",
				border: "1px solid #e5e7eb",
				borderRadius: "8px",
				background:
					"radial-gradient(circle at top left, #0f172a 0, #020617 40%, #020617 100%)",
				color: "#e5e7eb",
				boxShadow: "0 18px 45px rgba(15,23,42,0.55)",
			}}
		>
			<h3
				style={{
					margin: "0 0 4px 0",
					fontSize: "17px",
					letterSpacing: "0.04em",
					textTransform: "uppercase",
					color: "#a5b4fc",
				}}
			>
				{title}
			</h3>
			<p
				style={{
					margin: "0 0 12px 0",
					fontSize: "13px",
					color: "#9ca3af",
				}}
			>
				Hardcode your test PUUID here and trigger the Riot sync endpoint.
			</p>
			<label style={{ fontSize: "13px" }}>
				<span style={{ display: "block", marginBottom: 4 }}>PUUID</span>
				<input
					value={puuid}
					onChange={(e) => setPuuid(e.target.value)}
					placeholder="Riot PUUID"
					style={{
						width: "100%",
						padding: "8px 10px",
						borderRadius: "6px",
						border: "1px solid #4b5563",
						backgroundColor: "#020617",
						color: "#e5e7eb",
						fontSize: "13px",
					}}
				/>
			</label>

			<label style={{ fontSize: "13px" }}>
				<span style={{ display: "block", marginBottom: 4 }}>Region</span>
				<select
					value={region}
					onChange={(e) => setRegion(e.target.value as RiotRegion)}
					style={{
						width: "100%",
						padding: "8px 10px",
						borderRadius: "6px",
						border: "1px solid #4b5563",
						backgroundColor: "#020617",
						color: "#e5e7eb",
						fontSize: "13px",
					}}
				>
					{RIOT_REGIONS.map((r) => (
						<option key={r} value={r}>
							{RIOT_REGION_LABELS[r]}
						</option>
					))}
				</select>
			</label>

			<button
				type="submit"
				disabled={status === "loading" || !puuid.trim()}
				style={{
					marginTop: "4px",
					padding: "9px 14px",
					borderRadius: "999px",
					border: "none",
					fontSize: "13px",
					fontWeight: 600,
					letterSpacing: "0.06em",
					textTransform: "uppercase",
					background:
						status === "loading"
							? "linear-gradient(90deg,#4b5563,#6b7280)"
							: "linear-gradient(135deg,#4f46e5,#ec4899)",
					color: "#f9fafb",
					cursor: status === "loading" ? "wait" : "pointer",
					boxShadow:
						status === "loading"
							? "none"
							: "0 10px 25px rgba(236,72,153,0.4)",
					transition:
						"transform 120ms ease, box-shadow 120ms ease, filter 120ms ease",
					filter: status === "loading" ? "grayscale(0.2)" : "none",
				}}
			>
				{status === "loading" ? "Fetching…" : "Run Riot demo"}
			</button>

			{status === "error" && error && (
				<p style={{ margin: "4px 0 0 0", color: "#fca5a5", fontSize: "13px" }}>
					{error}
				</p>
			)}

			{status === "success" && (
				<div
					style={{
						marginTop: "12px",
						padding: "10px",
						borderRadius: "8px",
						backgroundColor: "rgba(15,23,42,0.75)",
						border: "1px solid rgba(148,163,184,0.35)",
						maxHeight: "260px",
						overflow: "auto",
						fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
						fontSize: "12px",
						lineHeight: 1.5,
					}}
				>
					<pre
						style={{
							margin: 0,
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
						}}
					>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			)}
		</form>
	);
}

