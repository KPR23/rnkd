"use client";

import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/src/trpc/client";
import {
	RIOT_REGION_LABELS,
	RIOT_REGIONS,
	RiotRegion,
	useAddLolAccountForm,
} from "@repo/forms";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/select";

const isRiotRegion = (value: string): value is RiotRegion =>
	RIOT_REGIONS.includes(value as RiotRegion);

export function AddRiotAccount() {
	const addLol = trpc.gameAccount.addLolAccount.useMutation({
		onSuccess: () => {
			toast.success("League of Legends account added.");
		},
		onError: (error) => {
			const code = error.data?.code;

			if (code === "CONFLICT") {
				toast.error("Account already exists.");
				return;
			}

			if (code === "BAD_REQUEST" || code === "NOT_FOUND") {
				toast.error("Failed to find Riot account. Check name and tag.");
				return;
			}

			toast.error("Failed to add League of Legends account.");
		},
	});
	const legacyForm = useAddLolAccountForm(addLol);

	const form = useForm({
		defaultValues: {
			gameName: legacyForm.gameName,
			tagLine: legacyForm.tagLine,
			region: RIOT_REGIONS[0],
		},
		validators: {
			onChange: ({ value }) => {
				const errors: Record<string, string> = {};
				if (value.gameName.length < 3 || value.gameName.length > 16) {
					errors.gameName = "Game name must be 3-16 characters";
				}
				if (value.tagLine.length < 3 || value.tagLine.length > 5) {
					errors.tagLine = "Tag line must be 3-5 characters";
				}
				return Object.keys(errors).length ? errors : undefined;
			},
		},
		onSubmit: async ({ value }) => {
			legacyForm.handleSubmit({
				gameName: value.gameName,
				tagLine: value.tagLine,
				region: value.region,
			});
		},
	});

	return (
		<Card className="w-full sm:max-w-xl">
			<CardHeader>
				<CardTitle>Add League of Legends account</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<form.Field name="gameName">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<div className="space-y-1" data-invalid={isInvalid}>
									<label
										htmlFor="riot-game-name"
										className="text-xs font-medium tracking-wide text-muted-foreground"
									>
										Game name
									</label>
									<Input
										id="riot-game-name"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											field.handleChange(e.target.value)
										}
										aria-invalid={isInvalid}
										placeholder="Game name (e.g. PlayerName)"
										autoComplete="off"
									/>
									{isInvalid && field.state.meta.errors && (
										<p className="text-[11px] text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
								</div>
							);
						}}
					</form.Field>

					<form.Field name="tagLine">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<div className="space-y-1" data-invalid={isInvalid}>
									<label
										htmlFor="riot-tag-line"
										className="text-xs font-medium tracking-wide text-muted-foreground"
									>
										Tag line
									</label>
									<Input
										id="riot-tag-line"
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											field.handleChange(e.target.value)
										}
										aria-invalid={isInvalid}
										placeholder="Tag line (e.g. EUW1)"
										autoComplete="off"
									/>
									{isInvalid && field.state.meta.errors && (
										<p className="text-[11px] text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
								</div>
							);
						}}
					</form.Field>

					<form.Field name="region">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<div className="space-y-1" data-invalid={isInvalid}>
									<label
										htmlFor="riot-region"
										className="text-xs font-medium tracking-wide text-muted-foreground"
									>
										Region
									</label>
									<Select
										name={field.name}
										value={field.state.value}
										onValueChange={(value: string) => {
											if (isRiotRegion(value)) {
												field.handleChange(
													value as typeof field.state.value,
												);
											}
										}}
									>
										<SelectTrigger
											id="riot-region"
											aria-invalid={isInvalid}
											className="w-full"
										>
											<SelectValue placeholder="Select region" />
										</SelectTrigger>
										<SelectContent>
											{RIOT_REGIONS.map((r) => (
												<SelectItem key={r} value={r}>
													{RIOT_REGION_LABELS[r]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && field.state.meta.errors && (
										<p className="text-[11px] text-destructive">
											{field.state.meta.errors.join(", ")}
										</p>
									)}
								</div>
							);
						}}
					</form.Field>

					<div className="pt-2">
						<Button
							type="submit"
							disabled={addLol.isPending}
							className="w-full"
						>
							{addLol.isPending ? "Saving…" : "Add LoL account"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
