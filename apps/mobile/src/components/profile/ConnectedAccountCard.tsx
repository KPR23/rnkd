import { useState, type ReactNode } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { CaretRightIcon, IconContext } from "phosphor-react-native";

import { useRouter } from "expo-router";

import {
  GAMES,
  isCs2FaceitGameAccount,
  isLolGameAccount,
  type Cs2FaceitGameAccount,
  type GameAccount,
  type LolGameAccount,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import GameLogo from "@/src/components/games/GameLogo";
import AccountDetailsModal from "@/src/components/profile/AccountDetailsModal";
import { DRAGON_CDN_VERSION } from "@/src/lib/constants/riotApiUrl";

const accountRowIconContext = {
  size: 19,
  color: colors.textMuted,
  weight: "bold" as const,
};

function LolAccountBody({ gameAccount }: { gameAccount: LolGameAccount }) {
  return (
    <View className="flex flex-row items-center gap-3">
      <Image
        source={{
          uri: `https://ddragon.leagueoflegends.com/cdn/${DRAGON_CDN_VERSION}/img/profileicon/${gameAccount.profile.profileIconId}.png`,
        }}
        className="h-12 w-12 rounded-full"
      />
      <View className="flex min-w-0 flex-1 flex-col gap-0.5">
        <View className="flex flex-row flex-wrap items-center gap-1.5">
          <Text className="font-sans-semibold text-text text-base">
            {gameAccount.profile.gameName}
          </Text>
          <Text className="font-sans-semibold text-text-secondary text-sm">
            #{gameAccount.profile.tagLine}
          </Text>
        </View>

        <View className="flex flex-row items-center gap-1">
          <Text className="font-mono-medium text-text-secondary text-xs uppercase">
            Level
          </Text>
          <Text className="font-mono-semibold text-text-secondary text-xs">
            {gameAccount.profile.summonerLevel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Cs2FaceitAccountBody({
  gameAccount,
}: {
  gameAccount: Cs2FaceitGameAccount;
}) {
  const faceitNick =
    gameAccount.profile?.faceitNickname?.trim() || gameAccount.externalId;
  const steamNick = gameAccount.profile?.steamNickname?.trim();
  const avatarUri = gameAccount.profile?.avatar?.trim();

  return (
    <View className="flex flex-row items-center gap-3">
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          className="h-12 w-12 rounded-full"
        />
      ) : (
        <View className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <Text
            className="font-mono-semibold text-text-muted text-[11px] uppercase"
            numberOfLines={1}
          >
            {faceitNick.slice(0, 2)}
          </Text>
        </View>
      )}
      <View className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text
          className="font-sans-semibold text-text text-base"
          numberOfLines={1}
        >
          {faceitNick}
        </Text>
        {steamNick ? (
          <Text
            className="font-mono-semibold text-text-secondary text-xs"
            numberOfLines={1}
          >
            {steamNick}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function FallbackAccountBody({ gameAccount }: { gameAccount: GameAccount }) {
  return (
    <View className="flex min-w-0 flex-1 flex-row items-center gap-3">
      <Text
        className="font-sans-semibold text-text text-base"
        numberOfLines={2}
      >
        {gameAccount.externalId}
      </Text>
    </View>
  );
}

function accountCardPresentation(gameAccount: GameAccount): {
  bgClass: string;
  label: string;
  body: ReactNode;
} {
  switch (gameAccount.gameId) {
    case GAMES.CS2_FACEIT:
      return {
        bgClass: "bg-games-cs2",
        label: "FACEIT",
        body: <Cs2FaceitAccountBody gameAccount={gameAccount} />,
      };
    case GAMES.LOL:
      if (!isLolGameAccount(gameAccount)) {
        return {
          bgClass: "bg-games-lol",
          label: "Unknown",
          body: <FallbackAccountBody gameAccount={gameAccount} />,
        };
      }
      return {
        bgClass: "bg-games-lol",
        label: gameAccount.profile.platformRoute,
        body: <LolAccountBody gameAccount={gameAccount} />,
      };
    default:
      return {
        bgClass: "dark",
        label: "Unknown",
        body: <FallbackAccountBody gameAccount={gameAccount} />,
      };
  }
}

export default function ConnectedAccountCard({
  gameAccount,
}: {
  gameAccount: GameAccount;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { bgClass, label, body } = accountCardPresentation(gameAccount);
  const isFaceit = isCs2FaceitGameAccount(gameAccount);

  return (
    <View className="flex flex-col">
      <View
        className={`flex h-12 w-full flex-row items-center justify-between px-3 py-2.5 ${bgClass}`}
      >
        <GameLogo gameId={gameAccount.gameId} maxHeight={22} />
        <Text className="font-mono-bold text-text text-right text-sm uppercase">
          {label}
        </Text>
      </View>
      <IconContext.Provider value={accountRowIconContext}>
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-card border-muted flex flex-row items-center justify-between border border-t-0 p-5"
          onPress={() => {
            if (isFaceit) {
              router.push(`/game-profile/${gameAccount.id}`);
              return;
            }
            setIsModalOpen(true);
          }}
        >
          <View className="min-w-0 flex-1 flex-row items-center">{body}</View>
          <View className="shrink-0">
            <CaretRightIcon />
          </View>
        </TouchableOpacity>
      </IconContext.Provider>

      {!isFaceit ? (
        <AccountDetailsModal
          gameAccount={gameAccount}
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </View>
  );
}
