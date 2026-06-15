import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import {
  GAMES,
  isCs2FaceitGameAccount,
  type GameAccount,
  type User,
} from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import AccountDetailsModal from "@/src/components/profile/AccountDetailsModal";
import GameProfileSection from "@/src/components/profile/GameProfileSection";
import MatchActivityGraph from "@/src/components/profile/MatchActivityGraph";
import ProfileInfoCard from "@/src/components/profile/ProfileInfoCard";
import ScreenTitle from "@/src/components/ScreenTitle";
import { useStickyHeaderScrollHandler } from "@/src/components/StickyHeaderShell";
import { useMessage } from "@/src/lib/messages/message-provider";
import { haptics } from "@/src/lib/haptics";
import { mergeProfileIdentity } from "@/src/lib/profile/merge-profile-identity";
import { sharePlayerProfile } from "@/src/lib/share/deep-links";
import { formatUserDisplayName } from "@/src/lib/user/format-user-display-name";
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
  const { showError } = useMessage();
  const [detailsAccount, setDetailsAccount] = useState<GameAccount | null>(
    null,
  );
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const overflowButtonRef = useRef<View>(null);
  const onStickyHeaderScroll = useStickyHeaderScrollHandler();

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

  type RelationshipData = NonNullable<
    ReturnType<typeof utils.friend.relationship.getData>
  >;

  const setRelationshipOptimistic = useCallback(
    (next: RelationshipData) => {
      utils.friend.relationship.setData({ userId: user.id }, next);
    },
    [utils.friend.relationship, user.id],
  );

  const withRelationshipOptimism = useCallback(
    (
      next: RelationshipData,
      mutate: () => Promise<unknown>,
      options?: { successHaptic?: boolean },
    ) => {
      void (async () => {
        await utils.friend.relationship.cancel({ userId: user.id });
        const previous = utils.friend.relationship.getData({ userId: user.id });
        setRelationshipOptimistic(next);
        try {
          await mutate();
          if (options?.successHaptic) {
            void haptics.success();
          }
          await invalidateRelationship();
        } catch (error) {
          if (previous) {
            utils.friend.relationship.setData({ userId: user.id }, previous);
          }
          void haptics.warning();
          if (error instanceof Error) {
            showError(error.message);
          }
        }
      })();
    },
    [
      invalidateRelationship,
      setRelationshipOptimistic,
      showError,
      user.id,
      utils.friend.relationship,
    ],
  );

  const requestMut = trpc.friend.request.useMutation();
  const acceptMut = trpc.friend.accept.useMutation();
  const declineMut = trpc.friend.decline.useMutation();
  const cancelMut = trpc.friend.cancelRequest.useMutation();
  const removeMut = trpc.friend.remove.useMutation();

  const globalRs = overview?.user.globalRs ?? 0;
  const displayUser = overview?.user
    ? mergeProfileIdentity(user, overview.user)
    : user;
  const isFriendActionPending =
    requestMut.isPending ||
    acceptMut.isPending ||
    declineMut.isPending ||
    cancelMut.isPending ||
    removeMut.isPending;

  const closeActionsMenu = () => {
    setIsActionsMenuOpen(false);
    setActionsMenuAnchor(null);
  };

  const openActionsMenu = () => {
    overflowButtonRef.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth } = Dimensions.get("window");
      setActionsMenuAnchor({
        top: y + height + 8,
        right: screenWidth - x - width,
      });
      setIsActionsMenuOpen(true);
    });
  };

  const handleRemoveFriend = () => {
    closeActionsMenu();
    withRelationshipOptimism(
      { status: "default", pendingDirection: undefined },
      () => removeMut.mutateAsync({ userId: user.id }),
      { successHaptic: true },
    );
  };

  const handleShareProfile = async () => {
    try {
      void haptics.tap();
      await sharePlayerProfile(displayUser);
    } catch {
      showError("Could not open sharing options.");
    }
  };

  const primaryButton = isOwnProfile ? (
    <Button
      variant="primary"
      actionText="Edit profile"
      className="flex-1"
      onPress={() => router.push("/personal-information")}
    />
  ) : relationship?.status === "friends" ? (
    <Button
      variant="primary"
      actionText="Invite"
      className="flex-1"
      disabled={isFriendActionPending}
      onPress={() =>
        router.push({
          pathname: "/groups-invite-player",
          params: { userId: user.id },
        })
      }
    />
  ) : relationship?.status === "pending" &&
    relationship?.pendingDirection === "outgoing" ? (
    <Button
      variant="secondary"
      actionText="Cancel invite"
      className="flex-1"
      disabled={isFriendActionPending}
      onPress={() =>
        withRelationshipOptimism(
          { status: "default", pendingDirection: undefined },
          () => cancelMut.mutateAsync({ userId: user.id }),
        )
      }
    />
  ) : relationship?.status === "default" ? (
    <Button
      variant="primary"
      actionText="Add friend"
      className="flex-1"
      disabled={isFriendActionPending}
      onPress={() =>
        withRelationshipOptimism(
          { status: "pending", pendingDirection: "outgoing" },
          () => requestMut.mutateAsync({ userId: user.id }),
        )
      }
    />
  ) : null;

  const shouldShowShare =
    isOwnProfile ||
    relationship?.status === "default" ||
    relationship?.status === "friends" ||
    (relationship?.status === "pending" &&
      relationship?.pendingDirection === "outgoing");

  const secondaryButton = shouldShowShare ? (
    <Button
      variant="secondary"
      actionText="Share"
      className="flex-1"
      onPress={() => void handleShareProfile()}
    />
  ) : null;

  const overflowButton =
    !isOwnProfile && relationship?.status === "friends" ? (
      <View ref={overflowButtonRef} collapsable={false}>
        <Button
          variant="secondary"
          actionText="···"
          className="w-12 px-0"
          disabled={isFriendActionPending}
          onPress={openActionsMenu}
        />
      </View>
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
      ) : null}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96, gap: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={(event) => {
          onStickyHeaderScroll?.(event);
        }}
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
            user={displayUser}
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
                  disabled={isFriendActionPending}
                  haptic="impact"
                  onPress={() =>
                    withRelationshipOptimism(
                      { status: "friends", pendingDirection: undefined },
                      () => acceptMut.mutateAsync({ requesterId: user.id }),
                    )
                  }
                />
                <Button
                  variant="secondary"
                  actionText="Decline"
                  className="flex-1"
                  disabled={isFriendActionPending}
                  onPress={() =>
                    withRelationshipOptimism(
                      { status: "default", pendingDirection: undefined },
                      () => declineMut.mutateAsync({ requesterId: user.id }),
                      { successHaptic: false },
                    )
                  }
                />
              </>
            ) : (
              <>
                {primaryButton}
                {secondaryButton}
                {overflowButton}
              </>
            )}
          </View>
          {incomingRequestCondition ? (
            <AppText className="text-sm" color={colors.textSecondary}>
              {formatUserDisplayName(displayUser)} sent you a friend request. You can accept
              or decline it here.
            </AppText>
          ) : null}
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
            {/* <AppText
              className="text-right text-sm"
              weight="medium"
              color={colors.primary}
            >
              View details
            </AppText> */}
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
              onOpenDetails={() => {
                if (isCs2FaceitGameAccount(account)) {
                  router.push(`/game-profile/${account.id}`);
                  return;
                }
                setDetailsAccount(account);
              }}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={isActionsMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeActionsMenu}
      >
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close actions menu"
            className="absolute inset-0"
            onPress={closeActionsMenu}
          />
          {actionsMenuAnchor ? (
            <View
              className="border-muted bg-card absolute min-w-48 border p-2"
              style={{
                top: actionsMenuAnchor.top,
                right: actionsMenuAnchor.right,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove friend"
                className="px-3 py-3"
                disabled={removeMut.isPending}
                onPress={handleRemoveFriend}
              >
                <AppText
                  className="text-sm"
                  color={colors.destructiveText}
                  weight="medium"
                >
                  Remove friend
                </AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>

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
