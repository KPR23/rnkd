import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  GAMES,
  RIOT_PLATFORM_TO_REGIONAL_ROUTE,
  type GameId,
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
  const [faceitNickname, setFaceitNickname] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "confirm">("input");

  const reset = () => {
    setGame(GAMES.LOL);
    setGameName("");
    setTagLine("");
    setPlatform("euw1");
    setFaceitNickname("");
    setFormError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const { data: faceitPlayer, isPending: isFaceitPlayerPending } =
    trpc.faceit.getFaceitPlayer.useQuery(
      {
        nickname: faceitNickname,
      },
      {
        enabled: step === "confirm" && !!faceitNickname,
      },
    );

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

  const handleSubmit = () => {
    setFormError(null);

    if (game === GAMES.LOL) {
      addLol({
        gameName: gameName.trim(),
        tagLine: tagLine.trim(),
        region,
      });
    }

    if (game === GAMES.CS2_FACEIT) {
      addFaceit({ externalId: faceitNickname.trim() });
    }
  };

  const handleContinue = () => {
    setStep("confirm");
  };

  const renderInputStep = () => {
    if (game === GAMES.LOL) {
      return (
        <LolAccountForm
          gameName={gameName}
          tagLine={tagLine}
          platform={platform}
          isPending={isPending}
          setGameName={setGameName}
          setTagLine={setTagLine}
          setPlatform={setPlatform}
        />
      );
    }

    if (game === GAMES.CS2_FACEIT) {
      return (
        <FaceitAccountForm
          faceitNickname={faceitNickname}
          isPending={isPending}
          setFaceitNickname={setFaceitNickname}
        />
      );
    }

    return null;
  };

  const renderConfirmStep = () => {
    return null;
  };

  const modalBody = step === "input" ? renderInputStep() : renderConfirmStep();

  const disabledCondition =
    isPending || formError || game === GAMES.LOL
      ? !gameName.trim() || !tagLine.trim()
      : !faceitNickname.trim();

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
              actionText={step === "input" ? "Continue" : "Connect"}
              onPress={step === "input" ? handleContinue : handleSubmit}
              disabled={disabledCondition}
            />
          )}
        </View>
      }
    >
      <View className="flex flex-col gap-6">
        {step === "input" && (
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
        )}
        {modalBody}
      </View>
    </CustomModal>
  );
}
