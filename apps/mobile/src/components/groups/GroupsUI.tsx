import { useMemo } from "react";
import {
  Image,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from "react-native";

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CaretLeftIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XIcon,
} from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import Button from "@/src/components/Button";

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

function formatInviteSentAgo(invitedAt: Date) {
  const diffMs = Date.now() - invitedAt.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) {
    return "Sent just now";
  }

  if (diffMins < 60) {
    return `Sent ${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMins / 60);

  if (diffHours < 24) {
    return `Sent ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Sent 1d ago" : `Sent ${diffDays}d ago`;
}

type BackHeaderProps = {
  title: string;
  centered?: boolean;
  onBack: () => void;
};

export function BackHeader({
  title,
  centered = false,
  onBack,
}: BackHeaderProps) {
  if (!centered) {
    return (
      <View className="mt-2 gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="size-6 items-center justify-center"
          onPress={onBack}
        >
          <CaretLeftIcon size={24} color={colors.text} />
        </Pressable>
        <AppText className="text-3xl" weight="medium">
          {title}
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="size-6 items-center justify-center"
        onPress={onBack}
      >
        <CaretLeftIcon size={24} color={colors.text} />
      </Pressable>
      <AppText className="text-xl leading-6" weight="medium">
        {title}
      </AppText>
      <View className="size-6" />
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
          RR
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
  onRemove,
}: {
  member: LeaderboardMember;
  manage?: boolean;
  selected?: boolean;
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
            </AppText>
            {member.pending ? (
              <AppText
                className="text-[13px] leading-4"
                color={colors.textSecondary}
              >
                Pending invite
              </AppText>
            ) : null}
          </View>
        </View>
        {manage && member.role !== "owner" ? (
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
              {member.rating ? `${member.rating} RR` : "- RR"}
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
          actionText="Accept"
          className="h-9! flex-1"
          disabled={disabled}
          variant="primary"
          onPress={onAccept}
        />
        <Button
          actionText="Decline"
          className="h-9! flex-1"
          disabled={disabled}
          variant="secondary"
          onPress={onDecline}
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
        actionText={primaryText}
        className="h-11 flex-1"
        variant="primary"
        onPress={onPrimaryPress}
      />
      <Button
        actionText={secondaryText}
        className="h-11 flex-1"
        variant="secondary"
        onPress={onSecondaryPress}
      />
    </View>
  );
}

export function GroupsTextInput({
  search,
  onClear,
  style,
  ...props
}: TextInputProps & { search?: boolean; onClear?: () => void }) {
  return (
    <View className="border-border h-13.5 flex-row items-center gap-3 border px-4">
      {search ? (
        <MagnifyingGlassIcon size={24} color={colors.textSecondary} />
      ) : null}
      <TextInput
        placeholderTextColor={colors.textSecondary}
        className="text-text h-13.5 min-w-0 flex-1 text-base leading-13.5"
        style={[{ includeFontPadding: false }, style]}
        autoCorrect={false}
        {...props}
      />
      {props.value && onClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear"
          className="ml-auto size-6 items-center justify-center"
          onPress={onClear}
        >
          <XIcon size={20} color={colors.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

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

export function WizardFooter({
  step,
  totalSteps,
  actionText,
  disabled,
  onPress,
}: {
  step?: number;
  totalSteps?: number;
  actionText: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View className="mb-8 gap-3">
      {step && totalSteps ? (
        <View className="flex-row justify-center gap-2.5">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              className={`size-2 ${index + 1 === step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </View>
      ) : null}
      <Button
        actionText={actionText}
        className="h-13.5"
        disabled={disabled}
        variant={disabled ? "secondary" : "primary"}
        onPress={onPress}
      />
    </View>
  );
}
