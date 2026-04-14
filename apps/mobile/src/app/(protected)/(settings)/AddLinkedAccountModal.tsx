import Button from "@/src/components/Button";
import CustomModal from "@/src/components/Modal";
import Tabs from "@/src/components/Tabs";
import { trpc } from "@/src/utils/trpc";
import { colors } from "@repo/ui/colors";
import { useState } from "react";
import {
	ActivityIndicator,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const LOL_REGIONS = ["americas", "europe", "asia", "sea"] as const;
type LolRegion = (typeof LOL_REGIONS)[number];

const REGION_LABEL: Record<LolRegion, string> = {
	americas: "Americas",
	europe: "Europe",
	asia: "Asia",
	sea: "SEA",
};

type GameChoice = "lol" | "faceit";

function mapMutationError(error: { message: string; data?: unknown }) {
	const data = error.data as { code?: string } | null | undefined;
	const code = data?.code;
	if (code === "CONFLICT") {
		return "This account is already linked.";
	}
	return error.message;
}

export default function AddLinkedAccountModal({
	visible,
	onClose,
}: {
	visible: boolean;
	onClose: () => void;
}) {
	const utils = trpc.useUtils();
	const [game, setGame] = useState<GameChoice>("lol");
	const [gameName, setGameName] = useState("");
	const [tagLine, setTagLine] = useState("");
	const [region, setRegion] = useState<LolRegion>("europe");
	const [faceitId, setFaceitId] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	const reset = () => {
		setGame("lol");
		setGameName("");
		setTagLine("");
		setRegion("europe");
		setFaceitId("");
		setFormError(null);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const { mutate: addLol, isPending: isLolPending } =
		trpc.gameAccount.addLolAccount.useMutation({
			onSuccess: () => {
				void utils.gameAccount.getGameAccounts.invalidate();
				handleClose();
			},
			onError: (err) => setFormError(mapMutationError(err)),
		});

	const { mutate: addFaceit, isPending: isFaceitPending } =
		trpc.gameAccount.addFaceitAccount.useMutation({
			onSuccess: () => {
				void utils.gameAccount.getGameAccounts.invalidate();
				handleClose();
			},
			onError: (err) => setFormError(mapMutationError(err)),
		});

	const isPending = isLolPending || isFaceitPending;

	const submit = () => {
		setFormError(null);
		if (game === "lol") {
			addLol({
				gameName: gameName.trim(),
				tagLine: tagLine.trim(),
				region,
			});
		} else {
			addFaceit({ externalId: faceitId.trim() });
		}
	};

	const disabledCondition =
		isPending || formError || game === "lol"
			? !gameName.trim() || !tagLine.trim() || !region
			: !faceitId.trim();

	return (
		<CustomModal
			visible={visible}
			onClose={handleClose}
			title="Connect new account"
			footer={
				<View className="flex flex-col gap-3">
					{formError ? (
						<Text className="text-sm text-destructive">{formError}</Text>
					) : null}
					{isPending ? (
						<View className="items-center py-2">
							<ActivityIndicator color={colors.text} />
						</View>
					) : (
						<Button
							variant="primary"
							actionText="Connect"
							onPress={submit}
							disabled={disabledCondition}
						/>
					)}
				</View>
			}
		>
			<View className="flex flex-col gap-6">
				<View className="flex flex-row gap-2">
					{(["lol", "faceit"] as const).map((g) => (
						<TouchableOpacity
							key={g}
							activeOpacity={0.7}
							onPress={() => {
								setGame(g);
								setFormError(null);
							}}
							className={`flex-1 border px-3 py-2.5 ${
								game === g ? "border-primary bg-primary/10" : "border-border"
							}`}
						>
							<Text
								className={`text-center text-sm font-sans-medium ${
									game === g ? "text-text" : "text-text-secondary"
								}`}
							>
								{g === "lol" ? "League of Legends" : "Counter-Strike 2"}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{game === "lol" ? (
					<View className="flex flex-col gap-3">
						<View>
							<Text className="mb-1.5 text-xs font-sans-medium text-text-secondary">
								Summoner name
							</Text>
							<TextInput
								placeholder="e.g. Faker"
								placeholderTextColor={colors.gray}
								className="border border-border bg-card px-3 py-3 text-text"
								autoCapitalize="none"
								autoCorrect={false}
								spellCheck={false}
								autoComplete="off"
								value={gameName}
								onChangeText={setGameName}
								editable={!isPending}
							/>
						</View>
						<View>
							<Text className="mb-1.5 text-xs font-sans-medium text-text-secondary">
								Tag line
							</Text>
							<TextInput
								placeholder="e.g. KR1"
								placeholderTextColor={colors.gray}
								className="border border-border bg-card px-3 py-3 text-text"
								autoCapitalize="none"
								autoCorrect={false}
								spellCheck={false}
								autoComplete="off"
								value={tagLine}
								onChangeText={setTagLine}
								editable={!isPending}
							/>
						</View>
						<View>
							<Text className="mb-1.5 text-xs font-sans-medium text-text-secondary">
								Riot routing region
							</Text>
							<View className="flex flex-row flex-wrap gap-2">
								{LOL_REGIONS.map((r) => (
									<TouchableOpacity
										key={r}
										activeOpacity={0.7}
										disabled={isPending}
										onPress={() => setRegion(r)}
										className={`border px-3 py-2 ${
											region === r
												? "border-primary bg-primary/10"
												: "border-border"
										}`}
									>
										<Text
											className={`text-xs font-sans-medium ${
												region === r ? "text-text" : "text-text-secondary"
											}`}
										>
											{REGION_LABEL[r]}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</View>
				) : (
					<View>
						<Text className="mb-1.5 text-xs font-sans-medium text-text-secondary">
							Faceit nickname
						</Text>
						<TextInput
							placeholder="e.g. m0NESY"
							placeholderTextColor={colors.gray}
							className="border border-border bg-card px-3 py-3 text-text"
							autoCapitalize="none"
							autoCorrect={false}
							spellCheck={false}
							autoComplete="off"
							value={faceitId}
							onChangeText={setFaceitId}
							editable={!isPending}
						/>
					</View>
				)}
			</View>
		</CustomModal>
	);
}
