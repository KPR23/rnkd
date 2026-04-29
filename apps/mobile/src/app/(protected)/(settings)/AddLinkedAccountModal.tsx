import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PlusIcon } from "phosphor-react-native";

import {
  FaceitPlayer,
  FaceitSuggestedPlayer,
  GAMES,
  RIOT_PLATFORM_TO_REGIONAL_ROUTE,
  type GameId,
  type RiotPlatformRoute,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import FaceitAccountPreviewCard from "@/src/app/(protected)/(settings)/FaceitAccountPreviewCard";
import Button from "@/src/components/Button";
import CustomModal from "@/src/components/Modal";
import { trpc } from "@/src/utils/trpc";

import FaceitAccountForm from "./FaceitAccountForm";
import LolAccountForm from "./LolAccountForm";

type ModalStep = "game" | "input" | "confirm" | "success";

function mapMutationError(error: { message: string; data?: unknown }) {
  const data = error.data as { code?: string } | null | undefined;
  const code = data?.code;
  if (code === "CONFLICT") {
    return "This account is already linked.";
  }
  return error.message;
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex flex-row items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${
            index === current ? "bg-text w-2" : "bg-border w-2"
          }`}
        />
      ))}
    </View>
  );
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
  const [step, setStep] = useState<ModalStep>("game");
  const [linkedFaceitPlayer, setLinkedFaceitPlayer] =
    useState<FaceitPlayer | null>(null);

  const reset = () => {
    setGame(GAMES.LOL);
    setGameName("");
    setTagLine("");
    setPlatform("euw1");
    setFaceitNickname("");
    setFormError(null);
    setStep("game");
    setLinkedFaceitPlayer(null);
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

  const { data: suggestedPlayers, isPending: isSuggestedPlayersPending } =
    trpc.faceit.getSuggestedPlayers.useQuery(
      {
        playerId: linkedFaceitPlayer?.player_id ?? "",
        limit: 3,
      },
      {
        enabled:
          step === "success" &&
          game === GAMES.CS2_FACEIT &&
          !!linkedFaceitPlayer?.player_id,
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
        setStep("success");
      },
      onError: (err) => setFormError(mapMutationError(err)),
    });

  const isSubmitting = isLolPending || isFaceitPending;
  const region = RIOT_PLATFORM_TO_REGIONAL_ROUTE[platform];
  const stepIndex =
    step === "game" ? 0 : step === "input" ? 1 : step === "confirm" ? 2 : 3;
  const stepCount = game === GAMES.CS2_FACEIT ? 4 : 3;
  const stepCopy =
    step === "game"
      ? {
          title: "Which account do you want to connect?",
          description: "Start by choosing the game account you want to add.",
        }
      : step === "input"
        ? {
            title:
              game === GAMES.CS2_FACEIT
                ? "What is your Faceit nickname?"
                : "What is your Riot ID?",
            description:
              game === GAMES.CS2_FACEIT
                ? "Enter your Faceit nickname so we can find the right CS2 profile."
                : "Enter the account details you want to track on RNKD.",
          }
        : step === "confirm"
          ? game === GAMES.CS2_FACEIT
            ? {
                title: "Is this your Faceit account?",
                description:
                  "Review the profile below before we attach it to your RNKD identity.",
              }
            : {
                title: "Ready to connect this account?",
                description:
                  "Review the details one last time before adding it to your profile.",
              }
          : {
              title: "Your Faceit account is connected.",
              description:
                "Your account is ready to track. Discover players worth following to get started.",
            };

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
      if (!faceitPlayer) {
        setFormError("We couldn't verify this Faceit account.");
        return;
      }

      setLinkedFaceitPlayer(faceitPlayer);
      addFaceit({ externalId: faceitNickname.trim() });
    }
  };

  const handleContinue = () => {
    setFormError(null);
    setStep(step === "game" ? "input" : "confirm");
  };

  const handleSecondaryAction = () => {
    setFormError(null);

    if (step === "game") {
      handleClose();
      return;
    }

    if (step === "input") {
      setStep("game");
      return;
    }

    if (step === "confirm") {
      setStep("input");
      return;
    }

    reset();
  };

  const renderGameStep = () => {
    return (
      <View className="flex flex-col gap-3">
        {([GAMES.LOL, GAMES.CS2_FACEIT] as const).map((g) => {
          const isSelected = game === g;

          return (
            <TouchableOpacity
              key={g}
              activeOpacity={0.7}
              onPress={() => {
                if (isSubmitting) return;
                setGame(g);
                setFormError(null);
              }}
              disabled={isSubmitting}
              className={`border px-4 py-4 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <View className="flex flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Text
                    className={`font-sans-semibold text-base ${
                      isSelected ? "text-text" : "text-text-secondary"
                    }`}
                  >
                    {g === GAMES.LOL ? "League of Legends" : "Counter-Strike 2"}
                  </Text>
                  <Text className="text-text-muted font-sans-medium text-sm">
                    {g === GAMES.LOL
                      ? "Connect your Riot account."
                      : "Connect your Faceit profile."}
                  </Text>
                </View>
                <View
                  className={`h-3 w-3 rounded-full ${
                    isSelected ? "bg-primary" : "bg-border"
                  }`}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderInputStep = () => {
    if (game === GAMES.LOL) {
      return (
        <LolAccountForm
          gameName={gameName}
          tagLine={tagLine}
          platform={platform}
          isPending={isSubmitting}
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
          isPending={isSubmitting}
          setFaceitNickname={setFaceitNickname}
        />
      );
    }

    return null;
  };

  const renderConfirmStep = () => {
    if (game === GAMES.LOL) {
      return (
        <Text className="text-text-secondary text-sm">
          Connect {gameName.trim()}#{tagLine.trim()}?
        </Text>
      );
    }
    if (game === GAMES.CS2_FACEIT) {
      if (isFaceitPlayerPending) {
        return <ActivityIndicator color={colors.text} />;
      }

      if (!faceitPlayer) {
        return (
          <Text className="text-destructive text-sm">
            Faceit player not found.
          </Text>
        );
      }

      return <FaceitAccountPreviewCard faceitPlayer={faceitPlayer} />;
    }
    return null;
  };

  const renderSuggestedPlayer = (player: FaceitSuggestedPlayer) => {
    return (
      <View
        key={player.player_id}
        className="flex flex-row items-stretch gap-3"
      >
        <View className="min-w-0 flex-1">
          <FaceitAccountPreviewCard faceitPlayer={player as FaceitPlayer} />
        </View>
        <TouchableOpacity
          activeOpacity={0.75}
          accessibilityLabel={`Invite ${player.nickname}`}
          accessibilityRole="button"
          className="border-border bg-card w-12 items-center justify-center border"
          onPress={() => {}}
        >
          <PlusIcon size={20} color={colors.text} weight="bold" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSuccessStep = () => {
    return (
      <View className="flex flex-col gap-8">
        {linkedFaceitPlayer ? (
          <FaceitAccountPreviewCard faceitPlayer={linkedFaceitPlayer} />
        ) : null}

        <View className="gap-5">
          <View className="gap-2">
            <Text className="text-text-secondary font-sans-semibold text-xs uppercase">
              Players worth adding
            </Text>
            <Text className="text-text-muted font-sans-medium text-sm leading-5">
              Suggested players from your Faceit friends list.
            </Text>
          </View>

          {isSuggestedPlayersPending ? (
            <View className="border-border bg-card w-full items-center border py-8">
              <ActivityIndicator color={colors.text} />
            </View>
          ) : suggestedPlayers?.length ? (
            <View className="w-full gap-4">
              {suggestedPlayers.map(renderSuggestedPlayer)}
            </View>
          ) : (
            <View className="border-border bg-card w-full border px-4 py-5">
              <Text className="text-text font-sans-semibold text-sm">
                No suggestions yet
              </Text>
              <Text className="text-text-secondary font-sans-medium mt-1 text-sm">
                {"We couldn't find any suggestions yet."}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const modalBody =
    step === "game"
      ? renderGameStep()
      : step === "input"
        ? renderInputStep()
        : step === "confirm"
          ? renderConfirmStep()
          : renderSuccessStep();

  const isInputInvalid =
    game === GAMES.LOL
      ? !gameName.trim() || !tagLine.trim()
      : !faceitNickname.trim();

  const isConfirmDisabled =
    isSubmitting ||
    !!formError ||
    (game === GAMES.LOL
      ? !gameName.trim() || !tagLine.trim()
      : !faceitNickname.trim() || !faceitPlayer || isFaceitPlayerPending);

  const primaryActionText =
    step === "success"
      ? "Close"
      : step === "confirm"
        ? "Connect this account"
        : "Continue";

  const secondaryActionText =
    step === "game"
      ? "Cancel"
      : step === "input"
        ? "Change game"
        : step === "confirm"
          ? game === GAMES.CS2_FACEIT
            ? "This isn't my account"
            : "Edit details"
          : "Connect another account";

  const footer = isSubmitting ? (
    <View className="flex flex-col gap-3">
      <View className="items-center py-2">
        <ActivityIndicator color={colors.text} />
      </View>
    </View>
  ) : (
    <View className="flex flex-col gap-3">
      {formError ? (
        <Text className="text-destructive text-sm">{formError}</Text>
      ) : null}
      <View className="flex flex-col gap-3">
        <Button
          variant="primary"
          actionText={primaryActionText}
          onPress={
            step === "success"
              ? handleClose
              : step === "confirm"
                ? handleSubmit
                : handleContinue
          }
          disabled={
            step === "success" || step === "game"
              ? false
              : step === "input"
                ? isInputInvalid
                : isConfirmDisabled
          }
        />
        <Button
          variant="secondary"
          actionText={secondaryActionText}
          onPress={handleSecondaryAction}
        />
      </View>
    </View>
  );

  return (
    <CustomModal
      visible={visible}
      onClose={handleClose}
      headerCenter={<StepDots current={stepIndex} total={stepCount} />}
      footer={footer}
    >
      <View className="flex flex-col gap-8 pt-1">
        <View className="gap-3">
          <Text className="text-text font-sans-bold text-3xl leading-tight">
            {stepCopy.title}
          </Text>
          <Text className="text-text-secondary font-sans-medium text-base leading-6">
            {stepCopy.description}
          </Text>
        </View>

        <View className="pt-1">{modalBody}</View>
      </View>
    </CustomModal>
  );
}
