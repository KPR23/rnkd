import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  GAMES,
  type GameId,
  RIOT_PLATFORM_TO_REGIONAL_ROUTE,
  type RiotPlatformRoute,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import Button from "@/src/components/Button";
import CustomModal from "@/src/components/Modal";
import { trpc } from "@/src/utils/trpc";

import FaceitAccountForm from "./FaceitAccountForm";
import LolAccountForm from "./LolAccountForm";

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
  const [game, setGame] = useState<GameId>(GAMES.LOL);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [platform, setPlatform] = useState<RiotPlatformRoute>("euw1");
  const [faceitId, setFaceitId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const reset = () => {
    setGame(GAMES.LOL);
    setGameName("");
    setTagLine("");
    setPlatform("euw1");
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
  const region = RIOT_PLATFORM_TO_REGIONAL_ROUTE[platform];

  const submit = () => {
    setFormError(null);
    if (game === GAMES.LOL) {
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
    isPending || formError || game === GAMES.LOL
      ? !gameName.trim() || !tagLine.trim()
      : !faceitId.trim();

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      title="Connect new account"
      footer={
        <View className="flex flex-col gap-3">
          {formError ? (
            <Text className="text-destructive text-sm">{formError}</Text>
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
          {([GAMES.LOL, GAMES.CS2_FACEIT] as const).map((g) => (
            <TouchableOpacity
              key={g}
              activeOpacity={0.7}
              onPress={() => {
                if (isPending) return;
                setGame(g);
                setFormError(null);
              }}
              disabled={isPending}
              className={`flex-1 border px-3 py-2.5 ${
                game === g ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <Text
                className={`font-sans-medium text-center text-sm ${
                  game === g ? "text-text" : "text-text-secondary"
                }`}
              >
                {g === GAMES.LOL ? "League of Legends" : "Counter-Strike 2"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {game === GAMES.LOL ? (
          <LolAccountForm
            gameName={gameName}
            tagLine={tagLine}
            platform={platform}
            isPending={isPending}
            setGameName={setGameName}
            setTagLine={setTagLine}
            setPlatform={setPlatform}
          />
        ) : game === GAMES.CS2_FACEIT ? (
          <FaceitAccountForm
            faceitId={faceitId}
            isPending={isPending}
            setFaceitId={setFaceitId}
          />
        ) : null}
      </View>
    </CustomModal>
  );
}
