"use client";

import { useForm } from "@tanstack/react-form";
import * as React from "react";
import { toast } from "sonner";

import { trpc } from "@/src/trpc/client";
import {
	RIOT_REGION_LABELS,
	RIOT_REGIONS,
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

export function AddRiotAccount() {
	const addLol = trpc.gameAccount.addLolAccount.useMutation({
		onSuccess: () => {
			toast.success("Dodano konto League of Legends.");
		},
		onError: (error) => {
			const code = error.data?.code;

			if (code === "CONFLICT") {
				toast.error("Takie konto League of Legends jest już dodane.");
				return;
			}

			if (code === "BAD_REQUEST" || code === "NOT_FOUND") {
				toast.error(
					"Nie udało się znaleźć konta Riot. Sprawdź nazwę i tag.",
				);
				return;
			}

			toast.error("Nie udało się dodać konta League of Legends.");
		},
	});
	const legacyForm = useAddLolAccountForm(addLol);

	const form = useForm({
		defaultValues: {
			gameName: legacyForm.gameName,
			tagLine: legacyForm.tagLine,
			region: RIOT_REGIONS[0],
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
										onValueChange={(value: string) =>
											field.handleChange(() => value as never)
										}
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
