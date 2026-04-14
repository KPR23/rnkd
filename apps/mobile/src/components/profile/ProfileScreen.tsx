import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";

import type { GameAccount, User } from "@repo/types";
import Button from "@/src/components/Button";
import Frame from "@/src/components/Frame";
import ScreenTitle, { ScreenTitleAction } from "@/src/components/ScreenTitle";
import UserProfileImage from "@/src/components/UserProfileImage";
import { trpc } from "@/src/utils/trpc";

import ProfileContent from "./ProfileContent";

export type ProfileScreenProps = {
  user: User;
  isOwnProfile: boolean;
  gameAccounts: GameAccount[] | undefined;
  title?: string;
  actions?: ScreenTitleAction[];
};

export default function ProfileScreen({
  user,
  isOwnProfile,
  gameAccounts,
  title,
  actions,
}: ProfileScreenProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

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
      actionText="Edit profile"
      className="flex-1"
      onPress={() => router.push("/settings")}
    />
  ) : (
    relationshipButton
  );

  const secondaryButton = isOwnProfile ? (
    <Button
      variant="secondary"
      actionText="Accounts"
      className="flex-1"
      onPress={() => router.push("/linked-accounts")}
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

  const incomingRequestButton = incomingRequestCondition ? (
    <View className="w-full flex-row gap-3">
      <Button
        variant="primary"
        actionText="Accept"
        className="flex-1"
        onPress={() => void acceptMut.mutateAsync({ requesterId: user.id })}
      />
      <Button
        variant="secondary"
        actionText="Decline"
        className="flex-1"
        onPress={() => void declineMut.mutateAsync({ requesterId: user.id })}
      />
    </View>
  ) : null;

  return (
    <>
      {title ? (
        <ScreenTitle title={title} actions={actions} />
      ) : (
        <View className="mt-2" />
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Frame>
          <View className="flex items-center gap-4">
            <UserProfileImage user={user} />
            <View className="flex flex-col items-center gap-1 text-center">
              <Text className="font-sans-bold text-text text-2xl">
                {user.name}
              </Text>
              {user.tag && (
                <Text className="font-mono-bold text-primary text-base">
                  @{user.tag}
                </Text>
              )}
            </View>
          </View>
          <View className="w-full flex-row gap-3">
            {incomingRequestCondition ? (
              <View className="w-full flex-row gap-3">
                {incomingRequestButton}
              </View>
            ) : (
              <View className="w-full flex-row gap-3">
                {primaryButton}
                {secondaryButton}
              </View>
            )}
          </View>
        </Frame>

        {gameAccounts && gameAccounts.length > 0 ? (
          <ProfileContent gameAccounts={gameAccounts} />
        ) : null}
      </ScrollView>
    </>
  );
}
