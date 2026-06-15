import { useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import {
  CheckCircleIcon,
  CheckIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "phosphor-react-native";

import {
  FaceitPlayer,
  FaceitSuggestedPlayer,
  GAMES,
  type GameId,
  type RiotPlatformRoute,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import FaceitAccountPreviewCard from "@/src/app/(protected)/(settings)/FaceitAccountPreviewCard";
import FormFieldFeedback from "@/src/components/FormFieldFeedback";
import GameLogo from "@/src/components/games/GameLogo";
import CustomModal from "@/src/components/Modal";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { useDebouncedValue } from "@/src/lib/hooks/useDebouncedValue";
import { useMessage } from "@/src/lib/messages/message-provider";
import { trpc } from "@/src/utils/trpc";

import FaceitAccountForm from "./FaceitAccountForm";
import LolAccountForm from "./LolAccountForm";

type ModalStep = "game" | "input" | "confirm" | "success";

const MIN_SUMMONER_NAME_LENGTH = 3;
const MAX_SUMMONER_NAME_LENGTH = 16;
const TAG_LINE_PATTERN = /^[a-zA-Z0-9]{3,5}$/;
const STEP_ORDER: ModalStep[] = ["game", "input", "confirm", "success"];
const GAME_TITLE: Record<GameId, string> = {
  [GAMES.LOL]: "League of Legends",
  [GAMES.CS2_FACEIT]: "Counter-Strike 2",
};

function isLolInputShapeValid(gameName: string, tagLine: string) {
  const trimmedGameName = gameName.trim();
  const trimmedTagLine = tagLine.trim();

  return (
    trimmedGameName.length >= MIN_SUMMONER_NAME_LENGTH &&
    trimmedGameName.length <= MAX_SUMMONER_NAME_LENGTH &&
    TAG_LINE_PATTERN.test(trimmedTagLine)
  );
}

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
  const { showError } = useMessage();
  const [game, setGame] = useState<GameId>(GAMES.LOL);
  const [gameName, setGameName] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [platform, setPlatform] = useState<RiotPlatformRoute>("euw1");
  const [faceitNickname, setFaceitNickname] = useState("");
  const [step, setStep] = useState<ModalStep>("game");
  const [linkedFaceitPlayer, setLinkedFaceitPlayer] =
    useState<FaceitPlayer | null>(null);

  const debouncedGameName = useDebouncedValue(gameName);
  const debouncedTagLine = useDebouncedValue(tagLine);
  const debouncedFaceitNickname = useDebouncedValue(faceitNickname);

  const trimmedGameName = gameName.trim();
  const trimmedTagLine = tagLine.trim();
  const trimmedDebouncedGameName = debouncedGameName.trim();
  const trimmedDebouncedTagLine = debouncedTagLine.trim();
  const trimmedDebouncedFaceitNickname = debouncedFaceitNickname.trim();
  const trimmedFaceitNickname = faceitNickname.trim();

  const canPreviewLol =
    isLolInputShapeValid(trimmedDebouncedGameName, trimmedDebouncedTagLine) &&
    trimmedDebouncedGameName === trimmedGameName &&
    trimmedDebouncedTagLine === trimmedTagLine;

  const lolPreview = trpc.gameAccount.previewLolAccount.useQuery(
    {
      gameName: trimmedDebouncedGameName,
      tagLine: trimmedDebouncedTagLine,
      platform,
    },
    {
      enabled:
        (step === "input" || step === "confirm") &&
        game === GAMES.LOL &&
        canPreviewLol,
    },
  );

  const canPreviewFaceit =
    !!trimmedDebouncedFaceitNickname &&
    trimmedDebouncedFaceitNickname === trimmedFaceitNickname;

  const faceitPreview = trpc.gameAccount.previewFaceitAccount.useQuery(
    { nickname: trimmedDebouncedFaceitNickname },
    {
      enabled:
        (step === "input" || step === "confirm") &&
        game === GAMES.CS2_FACEIT &&
        canPreviewFaceit,
    },
  );

  const faceitPlayer = faceitPreview.data?.found
    ? faceitPreview.data.player
    : null;

  const reset = () => {
    setGame(GAMES.LOL);
    setGameName("");
    setTagLine("");
    setPlatform("euw1");
    setFaceitNickname("");
    setStep("game");
    setLinkedFaceitPlayer(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
      onError: (err) => showError(mapMutationError(err)),
    });

  const { mutate: addFaceit, isPending: isFaceitPending } =
    trpc.gameAccount.addFaceitAccount.useMutation({
      onSuccess: () => {
        void utils.gameAccount.getGameAccounts.invalidate();
        setStep("success");
      },
      onError: (err) => showError(mapMutationError(err)),
    });

  const isSubmitting = isLolPending || isFaceitPending;
  const isFaceitPlayerPending = faceitPreview.isFetching;
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
    if (game === GAMES.LOL) {
      if (!isLolInputShapeValid(trimmedGameName, trimmedTagLine)) {
        showError("Summoner name must be 3 to 16 characters.");
        return;
      }

      if (!lolPreview.data?.found) {
        showError("Failed to find Riot account. Check name and tag.");
        return;
      }

      if (lolPreview.data.alreadyLinked) {
        showError("This account is already linked.");
        return;
      }

      addLol({
        gameName: trimmedGameName,
        tagLine: trimmedTagLine,
        platform,
      });
    }

    if (game === GAMES.CS2_FACEIT) {
      if (!faceitPlayer) {
        showError("We couldn't verify this Faceit account.");
        return;
      }

      if (faceitPreview.data?.alreadyLinked) {
        showError("This account is already linked.");
        return;
      }

      setLinkedFaceitPlayer(faceitPlayer);
      addFaceit({ externalId: trimmedFaceitNickname });
    }
  };

  const handleContinue = () => {
    setStep(step === "game" ? "input" : "confirm");
  };

  const handleSecondaryAction = () => {
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

  const isLolDebouncing =
    trimmedGameName !== trimmedDebouncedGameName ||
    trimmedTagLine !== trimmedDebouncedTagLine;
  const isLolChecking =
    canPreviewLol && (isLolDebouncing || lolPreview.isFetching);

  const lolInputFeedback = useMemo(() => {
    if (!trimmedGameName && !trimmedTagLine) {
      return null;
    }

    if (
      trimmedGameName.length > 0 &&
      (trimmedGameName.length < MIN_SUMMONER_NAME_LENGTH ||
        trimmedGameName.length > MAX_SUMMONER_NAME_LENGTH)
    ) {
      return {
        tone: "error" as const,
        message: "Summoner name must be 3 to 16 characters.",
      };
    }

    if (trimmedTagLine.length > 0 && !TAG_LINE_PATTERN.test(trimmedTagLine)) {
      return {
        tone: "error" as const,
        message: "Tag line must be 3 to 5 letters or numbers.",
      };
    }

    if (!canPreviewLol) {
      return null;
    }

    if (isLolChecking) {
      return { tone: "loading" as const, message: null };
    }

    if (!lolPreview.data?.found) {
      return {
        tone: "error" as const,
        message: "Failed to find Riot account. Check name and tag.",
      };
    }

    if (lolPreview.data.alreadyLinked) {
      return {
        tone: "error" as const,
        message: "This account is already linked.",
      };
    }

    return {
      tone: "success" as const,
      message: `Found ${lolPreview.data.gameName}#${lolPreview.data.tagLine}.`,
    };
  }, [
    canPreviewLol,
    isLolChecking,
    lolPreview.data,
    trimmedGameName,
    trimmedTagLine,
  ]);

  const isFaceitDebouncing =
    trimmedFaceitNickname !== trimmedDebouncedFaceitNickname;
  const isFaceitChecking =
    canPreviewFaceit && (isFaceitDebouncing || faceitPreview.isFetching);

  const faceitInputFeedback = useMemo(() => {
    if (!trimmedFaceitNickname) {
      return null;
    }

    if (!canPreviewFaceit) {
      return { tone: "loading" as const, message: null };
    }

    if (isFaceitChecking) {
      return { tone: "loading" as const, message: null };
    }

    if (!faceitPreview.data?.found) {
      return {
        tone: "error" as const,
        message: "Faceit player not found.",
      };
    }

    if (faceitPreview.data.alreadyLinked) {
      return {
        tone: "error" as const,
        message: "This account is already linked.",
      };
    }

    return {
      tone: "success" as const,
      message: `Found ${faceitPreview.data.player.nickname}.`,
    };
  }, [
    canPreviewFaceit,
    faceitPreview.data,
    isFaceitChecking,
    trimmedFaceitNickname,
  ]);

  const isLolInputReady =
    isLolInputShapeValid(trimmedGameName, trimmedTagLine) &&
    !isLolChecking &&
    lolPreview.data?.found === true &&
    lolPreview.data.alreadyLinked === false;

  const isFaceitInputReady =
    !!trimmedFaceitNickname &&
    !isFaceitChecking &&
    faceitPreview.data?.found === true &&
    faceitPreview.data.alreadyLinked === false;

  const renderStepProgress = () => {
    const currentStepIndex = STEP_ORDER.indexOf(step);
    const visibleSteps =
      step === "success" ? STEP_ORDER : STEP_ORDER.slice(0, 3);

    return (
      <View className="flex-row items-center gap-2">
        {visibleSteps.map((wizardStep, index) => {
          const isCurrent = wizardStep === step;
          const isComplete = index < currentStepIndex || step === "success";

          return (
            <View
              key={wizardStep}
              className={`h-1.5 flex-1 rounded-full ${
                isCurrent || isComplete ? "bg-primary" : "bg-muted"
              }`}
            />
          );
        })}
      </View>
    );
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
              }}
              disabled={isSubmitting}
              className={`border px-4 py-4 ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-muted bg-card"
              }`}
            >
              <View className="flex flex-row items-center justify-between gap-4">
                <View
                  className={`border-muted bg-background h-12 w-16 items-center justify-center border ${
                    isSelected ? "border-primary" : ""
                  }`}
                >
                  <GameLogo gameId={g} maxHeight={22} />
                </View>
                <View className="flex-1 gap-1">
                  <Text
                    className={`font-sans-semibold text-base ${
                      isSelected ? "text-text" : "text-text-secondary"
                    }`}
                  >
                    {GAME_TITLE[g]}
                  </Text>
                  <Text className="text-text-muted font-sans-medium text-sm">
                    {g === GAMES.LOL
                      ? "Connect your Riot account."
                      : "Connect your Faceit profile."}
                  </Text>
                </View>
                {isSelected ? (
                  <CheckCircleIcon
                    color={colors.primary}
                    size={24}
                    weight="fill"
                  />
                ) : (
                  <View className="border-muted h-5 w-5 rounded-full border" />
                )}
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
        <View className="gap-3">
          <LolAccountForm
            gameName={gameName}
            tagLine={tagLine}
            platform={platform}
            isPending={isSubmitting}
            setGameName={setGameName}
            setTagLine={setTagLine}
            setPlatform={setPlatform}
          />
          {lolInputFeedback ? (
            <FormFieldFeedback
              tone={lolInputFeedback.tone}
              message={lolInputFeedback.message}
            />
          ) : null}
        </View>
      );
    }

    if (game === GAMES.CS2_FACEIT) {
      return (
        <View className="gap-3">
          <FaceitAccountForm
            faceitNickname={faceitNickname}
            isPending={isSubmitting}
            setFaceitNickname={setFaceitNickname}
          />
          {faceitInputFeedback ? (
            <FormFieldFeedback
              tone={faceitInputFeedback.tone}
              message={faceitInputFeedback.message}
            />
          ) : null}
        </View>
      );
    }

    return null;
  };

  const renderConfirmStep = () => {
    if (game === GAMES.LOL) {
      const resolvedName =
        lolPreview.data?.found === true
          ? `${lolPreview.data.gameName}#${lolPreview.data.tagLine}`
          : `${trimmedGameName}#${trimmedTagLine}`;

      return (
        <View className="border-muted bg-card border p-4">
          <View className="flex-row items-center gap-4">
            <View className="border-muted bg-background h-12 w-16 items-center justify-center border">
              <GameLogo gameId={GAMES.LOL} maxHeight={22} />
            </View>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-text font-sans-semibold text-base">
                {resolvedName}
              </Text>
              <Text className="text-text-secondary font-sans-medium text-sm">
                League of Legends account
              </Text>
            </View>
            <ShieldCheckIcon color={colors.primary} size={24} weight="bold" />
          </View>
        </View>
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
          accessibilityState={{ disabled: true }}
          disabled
          // TODO: Wire this to the invite player flow once friend invites are available.
          className="border-border bg-card/60 w-12 items-center justify-center border opacity-50"
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
            <View className="border-muted bg-card w-full items-center border py-8">
              <ActivityIndicator color={colors.text} />
            </View>
          ) : suggestedPlayers?.length ? (
            <View className="w-full gap-4">
              {suggestedPlayers.map(renderSuggestedPlayer)}
            </View>
          ) : (
            <View className="border-muted bg-card w-full border px-4 py-5">
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
    game === GAMES.LOL ? !isLolInputReady : !isFaceitInputReady;

  const isConfirmDisabled =
    isSubmitting ||
    (game === GAMES.LOL
      ? !isLolInputReady
      : !isFaceitInputReady || !faceitPlayer || isFaceitPlayerPending);

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

  const footer = (
    <ScreenFooter
      loading={isSubmitting}
      primaryAction={{
        text: primaryActionText,
        onPress:
          step === "success"
            ? handleClose
            : step === "confirm"
              ? handleSubmit
              : handleContinue,
        disabled:
          step === "success" || step === "game"
            ? false
            : step === "input"
              ? isInputInvalid
              : isConfirmDisabled,
      }}
      secondaryAction={{
        text: secondaryActionText,
        onPress: handleSecondaryAction,
      }}
    />
  );

  return (
    <CustomModal visible={visible} onClose={handleClose} footer={footer}>
      <View className="flex flex-col gap-7 pt-1">
        {renderStepProgress()}

        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <View className="bg-muted h-8 w-8 items-center justify-center rounded-full">
              {step === "success" ? (
                <CheckIcon color={colors.primary} size={18} weight="bold" />
              ) : (
                <Text className="text-text font-sans-semibold text-sm">
                  {STEP_ORDER.indexOf(step) + 1}
                </Text>
              )}
            </View>
            <Text className="text-text-muted font-sans-semibold text-xs uppercase">
              Add game account
            </Text>
          </View>
          <Text className="text-text font-sans-medium text-3xl leading-tight">
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
