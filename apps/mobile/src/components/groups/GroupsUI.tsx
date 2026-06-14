import { useMemo, type RefObject } from "react";
import { Image, Pressable, TouchableOpacity, View } from "react-native";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckIcon,
  ClipboardIcon,
  DotsThreeVerticalIcon,
  UsersIcon,
  XIcon,
} from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";
import { HeaderBar } from "@/src/components/Header";
import { copyToClipboard } from "@/src/lib/clipboard";
import { useMessage } from "@/src/lib/messages/message-provider";

export type GroupSummary = {
  id: string;
  name: string;
  members: number;
  position: number | null;
};

export type LeaderboardMember = {
  id: string;
  rank: number;
  name: string;
  image?: string | null;
  rating: number | null;
  trend: number | null;
  pending?: boolean;
  joinRequest?: boolean;
  role?: "owner" | "member";
  status?: "active" | "invited";
};

export type FriendSuggestion = {
  id: string;
  username: string;
  displayName: string;
  image?: string | null;
};

export type GroupInvite = {
  membershipId: string;
  groupId: string;
  groupName: string;
  memberCount: number;
  invitedAt: Date;
  inviter: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
};

const HEADER_ACTION_HIT_SLOP = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
} as const;

type BackHeaderProps = {
  title: string;
  centered?: boolean;
  onBack: () => void;
  onMenuPress?: () => void;
  menuButtonRef?: RefObject<View | null>;
};

export function BackHeader({
  title,
  centered = false,
  onBack,
  onMenuPress,
  menuButtonRef,
}: BackHeaderProps) {
  if (centered) {
    return (
      <HeaderBar
        variant="centered"
        title={title}
        onBack={onBack}
        rightSlot={
          onMenuPress ? (
            <Pressable
              ref={menuButtonRef}
              accessibilityRole="button"
              accessibilityLabel="Open group menu"
              collapsable={false}
              hitSlop={HEADER_ACTION_HIT_SLOP}
              onPress={onMenuPress}
              className="size-6 items-center justify-center"
            >
              <DotsThreeVerticalIcon
                size={22}
                color={colors.text}
                weight="bold"
              />
            </Pressable>
          ) : undefined
        }
      />
    );
  }

  return <HeaderBar variant="leading" title={title} onBack={onBack} />;
}

export function InviteCodeCard({ inviteCode }: { inviteCode: string }) {
  const { showMessage, showError } = useMessage();
  return (
    <View className="border-muted bg-card gap-2 border px-4 py-5">
      <SectionLabel title="Invite code" />
      <View className="flex-row items-center justify-between">
        <AppText
          className="text-[28px] leading-8 tracking-[4px]"
          weight="medium"
        >
          {inviteCode}
        </AppText>
        <View>
          <Pressable
            className="size-6 items-center justify-center"
            onPress={async () => {
              const copied = await copyToClipboard(inviteCode);
              if (copied) {
                showMessage("Invite code copied to clipboard");
              } else {
                showError("Failed to copy invite code");
              }
            }}
          >
            <ClipboardIcon size={22} color={colors.text} weight="bold" />
          </Pressable>
        </View>
      </View>
      <AppText className="text-sm leading-5" color={colors.textSecondary}>
        Share this code so others can request to join your group.
      </AppText>
    </View>
  );
}

export function SectionLabel({ title }: { title: string }) {
  return (
    <AppText
      className="text-sm leading-5"
      color={colors.textSecondary}
      weight="medium"
    >
      {title}
    </AppText>
  );
}

export function GroupCard({
  group,
  onPress,
}: {
  group: GroupSummary;
  onPress?: () => void;
}) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.7}
      className="border-muted bg-card h-16 justify-center border px-4"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <AppText className="text-base leading-5.5" weight="medium">
            {group.name}
          </AppText>
          <AppText className="text-sm leading-5" color={colors.textSecondary}>
            {group.members} members
          </AppText>
        </View>
        <View className="items-end">
          <AppText className="text-base leading-5.5" weight="medium">
            {group.position ? `#${group.position}` : "-"}
          </AppText>
          <AppText
            className="text-[13px] leading-4"
            color={colors.textSecondary}
          >
            Your position
          </AppText>
        </View>
      </View>
    </Container>
  );
}

export function RatingSummaryCard({
  rating,
  position,
}: {
  rating: number;
  position: number | null;
}) {
  return (
    <View className="border-muted bg-card items-center border px-5 py-5">
      <AppText className="text-[28px] leading-8" weight="medium">
        {rating}{" "}
        <AppText
          className="text-[28px] leading-8"
          color={colors.primary}
          weight="medium"
        >
          RS
        </AppText>
      </AppText>
      <AppText
        className="text-base leading-5.5"
        color={colors.textSecondary}
        weight="medium"
      >
        {position
          ? `You're #${position} in your group`
          : "Join the leaderboard"}
      </AppText>
    </View>
  );
}

function AvatarBubble({
  name,
  image,
  size = 36,
}: {
  name: string;
  image?: string | null;
  size?: number;
}) {
  const initials = useMemo(
    () =>
      name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [name],
  );

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        className="rounded-full"
        resizeMode="cover"
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <View
      className="bg-button items-center justify-center rounded-full"
      style={{ height: size, width: size }}
    >
      <AppText className="text-xs" weight="medium">
        {initials}
      </AppText>
    </View>
  );
}

function TrendIndicator({ trend }: { trend: number | null }) {
  if (trend === null) {
    return null;
  }

  if (trend > 0) {
    return (
      <View className="h-3 flex-row items-center justify-end gap-px">
        <ArrowUpIcon size={12} color={colors.success} />
        <AppText
          className="text-xs"
          color={colors.success}
          style={{ lineHeight: 12 }}
        >
          {trend}
        </AppText>
      </View>
    );
  }

  if (trend < 0) {
    return (
      <View className="h-3 flex-row items-center justify-end gap-px">
        <ArrowDownIcon size={12} color={colors.destructive} />
        <AppText
          className="text-xs"
          color={colors.destructive}
          style={{ lineHeight: 12 }}
        >
          {Math.abs(trend)}
        </AppText>
      </View>
    );
  }

  return (
    <View className="h-3 flex-row items-center justify-end gap-px">
      <ArrowRightIcon size={12} color={colors.textSecondary} />
      <AppText
        className="text-xs"
        color={colors.textSecondary}
        style={{ lineHeight: 12 }}
      >
        0
      </AppText>
    </View>
  );
}

export function LeaderboardRow({
  member,
  manage,
  selected,
  isCurrentUser,
  onAccept,
  onDecline,
  onRemove,
}: {
  member: LeaderboardMember;
  manage?: boolean;
  selected?: boolean;
  isCurrentUser?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onRemove?: () => void;
}) {
  return (
    <View className="border-muted bg-card min-h-15 justify-center border px-3.5 py-3">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="flex-row items-center gap-3 pl-1">
            <AppText
              className="w-2 text-sm leading-5"
              color={colors.textSecondary}
              weight="medium"
            >
              {member.rank}
            </AppText>
            <AvatarBubble name={member.name} image={member.image} />
          </View>
          <View className="min-w-0 justify-center">
            <AppText className="text-base leading-5.5" weight="medium">
              {member.name}
              {isCurrentUser ? (
                <AppText
                  className="text-base leading-5.5"
                  color={colors.textSecondary}
                  weight="medium"
                >
                  {" "}
                  (You)
                </AppText>
              ) : null}
            </AppText>
            {member.pending ? (
              <AppText
                className="text-[13px] leading-4"
                color={colors.textSecondary}
              >
                {member.joinRequest ? "Join request" : "Pending invite"}
              </AppText>
            ) : null}
          </View>
        </View>
        {manage && member.pending ? (
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Accept ${member.name}`}
              className="size-8 items-center justify-center"
              onPress={onAccept}
            >
              <CheckIcon size={22} color={colors.success} weight="bold" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Decline ${member.name}`}
              className="size-8 items-center justify-center"
              onPress={onDecline}
            >
              <XIcon size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : manage && member.role !== "owner" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${member.name}`}
            className="size-8 items-center justify-center"
            onPress={onRemove}
          >
            <XIcon size={24} color={colors.textSecondary} />
          </Pressable>
        ) : manage ? (
          <View className="size-8" />
        ) : (
          <View className="h-9 items-end justify-center gap-0.5">
            <AppText
              className="text-right text-sm"
              weight="medium"
              style={{ lineHeight: 20 }}
            >
              {member.rating ? `${member.rating} RS` : "- RS"}
            </AppText>
            {member.trend === null ? null : (
              <TrendIndicator trend={member.trend} />
            )}
          </View>
        )}
      </View>
      {selected ? (
        <View className="absolute top-3 left-13 size-9 items-center justify-center rounded-full bg-black/50">
          <CheckIcon size={18} color={colors.text} weight="bold" />
        </View>
      ) : null}
    </View>
  );
}

export function GroupInviteCard({
  invite,
  disabled,
  onAccept,
  onDecline,
}: {
  invite: GroupInvite;
  disabled?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const inviterName = invite.inviter?.name ?? "Someone";

  return (
    <View className="border-muted bg-card gap-4 border px-4 py-4">
      <View className="flex-row items-center justify-between">
        <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
          <AvatarBubble
            name={inviterName}
            image={invite.inviter?.image}
            size={36}
          />
          <View className="min-w-0 flex-1 gap-0.5">
            <AppText className="text-base leading-5" weight="medium">
              {invite.groupName}
            </AppText>
            <AppText
              className="text-[13px] leading-4"
              color={colors.textSecondary}
            >
              {inviterName} invited you
            </AppText>
          </View>
        </View>
        <View className="ml-3 flex-row items-center gap-1.5">
          <UsersIcon size={18} color={colors.textSecondary} />
          <AppText
            className="text-[13px] leading-4"
            color={colors.textSecondary}
          >
            {invite.memberCount}{" "}
            {invite.memberCount === 1 ? "member" : "members"}
          </AppText>
        </View>
      </View>
      <View className="flex-row gap-3">
        <Button
          actionText="Decline"
          className="h-9! flex-1"
          disabled={disabled}
          variant="secondary"
          onPress={onDecline}
        />
        <Button
          actionText="Accept"
          className="h-9! flex-1"
          disabled={disabled}
          variant="primary"
          onPress={onAccept}
        />
      </View>
    </View>
  );
}

export function GroupsButtonRow({
  primaryText,
  secondaryText,
  onPrimaryPress,
  onSecondaryPress,
}: {
  primaryText: string;
  secondaryText: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
}) {
  return (
    <View className="flex-row gap-3">
      <Button
        actionText={secondaryText}
        className="h-11 flex-1"
        variant="secondary"
        onPress={onSecondaryPress}
      />
      <Button
        actionText={primaryText}
        className="h-11 flex-1"
        variant="primary"
        onPress={onPrimaryPress}
      />
    </View>
  );
}

export { TextField as GroupsTextInput } from "@/src/components/TextField";

export function FriendSuggestionRow({
  friend,
  selected,
  onPress,
}: {
  friend: FriendSuggestion;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="border-muted bg-card min-h-17 flex-row items-center border pl-4"
      onPress={onPress}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <AvatarBubble name={friend.username} image={friend.image} size={44} />
        <View className="gap-0.5">
          <AppText className="text-base leading-5.5" weight="medium">
            {friend.displayName}
          </AppText>
          <AppText
            className="text-[13px] leading-4"
            color={colors.textSecondary}
          >
            {friend.username}
          </AppText>
        </View>
      </View>
      <View className="bg-muted h-11 w-px" />
      <View className="w-15 items-center">
        <View className="bg-muted size-6 items-center justify-center">
          {selected ? (
            <CheckIcon size={16} color={colors.text} weight="bold" />
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
