import { ActivityIndicator, Text, View } from "react-native";

import { Stack, useRouter } from "expo-router";
import {
  AsteriskIcon,
  FileTextIcon,
  GlobeIcon,
  HeadsetIcon,
  LinkIcon,
  SunIcon,
  UserIcon,
} from "phosphor-react-native";

import Button from "@/src/components/Button";
import { HeaderBar } from "@/src/components/Header";
import Screen from "@/src/components/Screen";
import ScreenScroll from "@/src/components/ScreenScroll";
import SettingsCard from "@/src/components/settings/SettingsCard";
import UserHeader from "@/src/components/UserHeader";
import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { APP_VERSION, APP_YEAR } from "@/src/lib/constants/app-version";

export default function SettingsScreen() {
  const router = useRouter();
  const { data: session, isPending } = useAuth();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace("/(auth)/sign-in");
  };

  if (isPending) {
    return (
      <View className="bg-background flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!session?.user) {
    return null;
  }

  const settingsSections = [
    {
      title: "Account details",
      items: [
        {
          title: "Personal information",
          icon: <UserIcon />,
          onPress: () => router.push("/personal-information"),
        },
        {
          title: "Linked accounts",
          icon: <LinkIcon />,
          onPress: () => router.push("/linked-accounts"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          title: "Appearance",
          icon: <SunIcon />,
          onPress: () => void 0,
        },
        {
          title: "Language",
          icon: <GlobeIcon />,
          onPress: () => void 0,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          title: "Contact support",
          icon: <HeadsetIcon />,
          onPress: () => void 0,
        },
        {
          title: "Feedback",
          icon: <AsteriskIcon />,
          onPress: () => void 0,
        },
        {
          title: "Terms of service",
          icon: <FileTextIcon />,
          onPress: () => void 0,
        },
      ],
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen safeAreaEdges={["top"]}>
        <ScreenScroll
          header={<HeaderBar variant="centered" title="Settings" />}
        >
          <UserHeader user={session.user} />

          <View className="flex flex-col gap-4">
            {settingsSections.map((section) => (
              <View key={section.title} className="flex flex-col gap-2">
                <Text className="font-sans-semibold text-text-secondary text-sm">
                  {section.title}
                </Text>

                {section.items.map((item) => (
                  <SettingsCard
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            ))}
          </View>
          <Button
            variant="destructive"
            actionText="Sign out"
            className="w-full"
            onPress={handleSignOut}
          />
          <View className="items-center">
            <Text className="text-text-muted text-center text-sm">
              Version {APP_VERSION}
            </Text>
            <Text className="text-text-muted text-center text-sm">
              © {APP_YEAR} KPR&apos;s Lab. All rights reserved.
            </Text>
          </View>
        </ScreenScroll>
      </Screen>
    </>
  );
}
