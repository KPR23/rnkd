import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";

import { GAMES, type GameAccount, type User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import AccountDetailsModal from "@/src/components/profile/AccountDetailsModal";
import GameProfileSection from "@/src/components/profile/GameProfileSection";
import MatchActivityGraph from "@/src/components/profile/MatchActivityGraph";
import ProfileInfoCard from "@/src/components/profile/ProfileInfoCard";
import ScreenTitle from "@/src/components/ScreenTitle";
import { trpc } from "@/src/utils/trpc";

export type ProfilePullToRefresh = {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
};

export type ProfileScreenProps = {
  user: User;
  isOwnProfile: boolean;
  gameAccounts: GameAccount[] | undefined;
  title?: string;
  pullToRefresh?: ProfilePullToRefresh;
};

function favoriteGameLabel(gameId: string | null | undefined) {
  switch (gameId) {
    case GAMES.CS2_FACEIT:
      return "CS2";
    case GAMES.LOL:
      return "LoL";
    default:
      return null;
  }
}

export default function ProfileScreen({
  user,
  isOwnProfile,
  gameAccounts,
  title,
  pullToRefresh,
}: ProfileScreenProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [detailsAccount, setDetailsAccount] = useState<GameAccount | null>(
    null,
  );

  const { data: overview } = trpc.profile.getOverview.useQuery({
    userId: user.id,
  });

  const { data: activityDays } = trpc.profile.getMatchActivity.useQuery({
    userId: user.id,
  });

  const { data: relationship } = trpc.friend.relationship.useQuery(
    { userId: user.id },
    { enabled: !isOwnProfile },
  );

  const invalidateRelationship = useCallback(async () => {
    await utils.friend.relationship.invalidate({ userId: user.id });
  }, [utils.friend.relationship, user.id]);

  const requestMut = trpc.friend.request.useMutation({
    onSuccess: invalidateRelationship,
  });
  const acceptMut = trpc.friend.accept.useMutation({
    onSuccess: invalidateRelationship,
  });
  const declineMut = trpc.friend.decline.useMutation({
    onSuccess: invalidateRelationship,
  });
  const cancelMut = trpc.friend.cancelRequest.useMutation({
    onSuccess: invalidateRelationship,
  });
  const removeMut = trpc.friend.remove.useMutation({
    onSuccess: invalidateRelationship,
  });

  const globalRs = overview?.user.globalRs ?? 0;

  const relationshipButton =
    relationship?.status === "friends" ? (
      <Button
        variant="primary"
        actionText="Message"
        className="flex-1"
        onPress={() => void 0}
      />
    ) : relationship?.status === "pending" &&
      relationship?.pendingDirection === "outgoing" ? (
      <Button
        variant="secondary"
        actionText="Cancel request"
        className="flex-1"
        onPress={() => void cancelMut.mutateAsync({ userId: user.id })}
      />
    ) : relationship?.status === "default" ? (
      <Button
        variant="primary"
        actionText="Add friend"
        className="flex-1"
        onPress={() => void requestMut.mutateAsync({ userId: user.id })}
      />
    ) : null;

  const primaryButton = isOwnProfile ? (
    <Button
      variant="primary"
      actionText="Invite"
      className="flex-1"
      onPress={() => void 0}
    />
  ) : (
    relationshipButton
  );

  const secondaryButton = isOwnProfile ? (
    <Button
      variant="secondary"
      actionText="Share"
      className="flex-1"
      onPress={() => void 0}
    />
  ) : relationship?.status === "friends" ? (
    <Button
      variant="secondary"
      actionText="Remove friend"
      className="flex-1"
      onPress={() => void removeMut.mutateAsync({ userId: user.id })}
    />
  ) : null;

  const incomingRequestCondition =
    relationship?.status === "pending" &&
    relationship?.pendingDirection === "incoming";

  const sortedAccounts = [...(gameAccounts ?? [])].sort((a, b) => {
    const favorite = overview?.user.favoriteGame?.id;
    if (a.gameId === favorite) return -1;
    if (b.gameId === favorite) return 1;
    return 0;
  });

  return (
    <>
      {title ? (
        <ScreenTitle
          title={title}
          showRsBadge={isOwnProfile}
          showSettings={isOwnProfile}
          globalRs={globalRs}
        />
      ) : (
        <View className="mt-2" />
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          pullToRefresh ? (
            <RefreshControl
              refreshing={pullToRefresh.refreshing}
              onRefresh={() => pullToRefresh.onRefresh()}
            />
          ) : undefined
        }
      >
        <View className="flex flex-col gap-2.5">
          <ProfileInfoCard
            user={user}
            bio={overview?.user.bio ?? null}
            favoriteGameLabel={favoriteGameLabel(
              overview?.user.favoriteGame?.id,
            )}
            region={overview?.user.region ?? null}
            lastActiveAt={overview?.lastActiveAt ?? null}
          />

          <View className="flex w-full flex-row gap-2.5">
            {incomingRequestCondition ? (
              <>
                <Button
                  variant="primary"
                  actionText="Accept"
                  className="flex-1"
                  onPress={() =>
                    void acceptMut.mutateAsync({ requesterId: user.id })
                  }
                />
                <Button
                  variant="secondary"
                  actionText="Decline"
                  className="flex-1"
                  onPress={() =>
                    void declineMut.mutateAsync({ requesterId: user.id })
                  }
                />
              </>
            ) : (
              <>
                {primaryButton}
                {secondaryButton}
                {isOwnProfile ? (
                  <Button
                    variant="secondary"
                    actionText="···"
                    className="w-12 px-0"
                    onPress={() => router.push("/settings")}
                  />
                ) : null}
              </>
            )}
          </View>
        </View>

        <View className="flex flex-col gap-2">
          <View className="flex flex-row items-center justify-between">
            <AppText
              className="text-sm"
              weight="medium"
              color={colors.textSecondary}
            >
              Match activity
            </AppText>
            <AppText
              className="text-right text-sm"
              weight="medium"
              color={colors.primary}
            >
              View details
            </AppText>
          </View>
          <View className="border-muted bg-card flex flex-col gap-3 border p-4">
            {activityDays ? <MatchActivityGraph days={activityDays} /> : null}
          </View>
        </View>
        <View className="flex flex-col gap-8">
          {sortedAccounts.map((account) => (
            <GameProfileSection
              key={account.id}
              gameAccount={account}
              onOpenDetails={() => setDetailsAccount(account)}
            />
          ))}
        </View>
      </ScrollView>

      {detailsAccount ? (
        <AccountDetailsModal
          gameAccount={detailsAccount}
          visible={!!detailsAccount}
          onClose={() => setDetailsAccount(null)}
        />
      ) : null}
    </>
  );
}
