import { View } from "react-native";

import { QuotesIcon } from "phosphor-react-native";

import type { User } from "@repo/types";
import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import UserProfileImage from "@/src/components/UserProfileImage";
import { formatRelativeLastActive } from "@/src/lib/helper/profileTime";

type ProfileInfoCardProps = {
  user: User;
  bio: string | null;
  favoriteGameLabel: string | null;
  region: string | null;
  lastActiveAt: Date | null;
};

function StatColumn({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-0 flex-1 items-center gap-0">
      <AppText className="text-base" weight="medium" numberOfLines={1}>
        {value}
      </AppText>
      <AppText
        className="text-[13px]"
        weight="regular"
        color={colors.textSecondary}
      >
        {label}
      </AppText>
    </View>
  );
}

export default function ProfileInfoCard({
  user,
  bio,
  favoriteGameLabel,
  region,
  lastActiveAt,
}: ProfileInfoCardProps) {
  return (
    <View className="border-muted bg-card flex flex-col gap-4 border px-5 py-4">
      <View className="flex flex-row items-center gap-4">
        <UserProfileImage user={user} size={64} />
        <View className="flex-1 flex-col gap-0">
          <AppText className="text-xl" weight="medium">
            {user.tag}
          </AppText>
          <AppText
            className="text-base"
            weight="regular"
            color={colors.textSecondary}
          >
            {user.name}
          </AppText>
        </View>
      </View>

      {bio ? (
        <View className="flex flex-row gap-2">
          <QuotesIcon size={16} color="#6d28d9" weight="fill" />
          <AppText className="text-sm" weight="regular">
            {bio}
          </AppText>
        </View>
      ) : null}

      <View className="bg-muted h-px" />

      <View className="flex flex-row gap-3">
        <StatColumn label="Favorite game" value={favoriteGameLabel ?? "—"} />
        <StatColumn label="Region" value={region ?? "—"} />
        <StatColumn
          label="Last active"
          value={formatRelativeLastActive(lastActiveAt)}
        />
      </View>
    </View>
  );
}
