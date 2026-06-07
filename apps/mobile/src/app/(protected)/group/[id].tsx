import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { colors } from "@repo/ui/colors";
import {
  BackHeader,
  GroupsButtonRow,
  LeaderboardRow,
  RatingSummaryCard,
  SectionLabel,
} from "@/src/components/groups/GroupsUI";
import AppText from "@/src/components/AppText";
import Screen from "@/src/components/Screen";
import { copyToClipboard } from "@/src/lib/clipboard";
import { goBackFromGroup } from "@/src/lib/navigation/groups";
import { trpc } from "@/src/utils/trpc";

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { id, returnTo } = useLocalSearchParams<{
    id: string;
    returnTo?: string;
  }>();
  const utils = trpc.useUtils();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const menuButtonRef = useRef<View>(null);
  const { data, isLoading, isError, isRefetching } = trpc.group.detail.useQuery(
    { groupId: id ?? "" },
    { enabled: !!id },
  );

  const handlePullRefresh = useCallback(async () => {
    if (!id) return;

    try {
      await Promise.all([
        utils.group.detail.invalidate({ groupId: id }),
        utils.group.list.invalidate(),
      ]);
    } catch (error) {
      console.error("Group pull-to-refresh failed", error);
    }
  }, [id, utils.group.detail, utils.group.list]);
  const leaveGroup = trpc.group.leave.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
      goBackFromGroup(router, returnTo);
    },
  });
  const deleteGroup = trpc.group.deleteGroup.useMutation({
    onSuccess: async () => {
      await utils.group.invalidate();
      goBackFromGroup(router, returnTo);
    },
  });

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
    setMenuAnchor(null);
  };

  const openMenu = () => {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      const { width: screenWidth } = Dimensions.get("window");
      setMenuAnchor({
        top: y + height + 8,
        right: screenWidth - x - width,
      });
      setIsMenuOpen(true);
    });
  };

  const handleCopyInviteCode = async () => {
    closeMenu();
    const inviteCode = data?.group.inviteCode ?? "";
    const copied = await copyToClipboard(inviteCode);

    if (copied) {
      Alert.alert("Copied", "Invite code copied to clipboard.");
      return;
    }

    Alert.alert("Invite code", inviteCode);
  };

  const confirmDeleteGroup = () => {
    closeMenu();
    Alert.alert(
      "Remove group",
      `Are you sure you want to remove ${data?.group.name ?? "this group"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => deleteGroup.mutate({ groupId: id }),
        },
      ],
    );
  };

  const confirmLeaveGroup = () => {
    Alert.alert(
      "Leave group",
      `Are you sure you want to leave ${data?.group.name ?? "this group"}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => leaveGroup.mutate({ groupId: id }),
        },
      ],
    );
  };

  if (isError || !data) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center">
          <AppText className="text-center text-sm" color="#828083">
            Group not found.
          </AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handlePullRefresh}
          />
        }
      >
        <View className="gap-6 pb-6">
          <BackHeader
            title={data.group.name}
            centered
            menuButtonRef={menuButtonRef}
            onBack={() => goBackFromGroup(router, returnTo)}
            onMenuPress={data.canManage ? openMenu : undefined}
          />

          <View className="gap-3">
            <RatingSummaryCard
              rating={data.currentUserRating}
              position={data.currentUserPosition}
            />
            <GroupsButtonRow
              primaryText="Invite"
              secondaryText={
                data.canManage ? "Manage players" : "Leave group"
              }
              onPrimaryPress={() =>
                router.push({
                  pathname: "/groups-invite",
                  params: {
                    mode: "invite",
                    groupId: data.group.id,
                    groupName: data.group.name,
                  },
                })
              }
              onSecondaryPress={
                data.canManage
                  ? () =>
                      router.push({
                        pathname: "/groups-manage",
                        params: { groupId: data.group.id },
                      })
                  : confirmLeaveGroup
              }
            />
          </View>

          <View className="gap-2.5">
            <SectionLabel title="Leaderboard" />
            <View className="gap-2">
              {data.members
                .filter((member) => member.status === "active")
                .map((member) => (
                  <LeaderboardRow key={member.id} member={member} />
                ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <View className="flex-1">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close group menu"
            className="absolute inset-0"
            onPress={closeMenu}
          />
          {menuAnchor ? (
            <View
              className="border-muted bg-card absolute min-w-52 border p-2"
              style={{
                top: menuAnchor.top,
                right: menuAnchor.right,
              }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy invite code"
                className="px-3 py-3"
                onPress={() => void handleCopyInviteCode()}
              >
                <AppText className="text-sm" weight="medium">
                  Copy invite code
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove group"
                className="px-3 py-3"
                disabled={deleteGroup.isPending}
                onPress={confirmDeleteGroup}
              >
                <AppText
                  className="text-sm"
                  color={colors.destructiveText}
                  weight="medium"
                >
                  Remove group
                </AppText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}
