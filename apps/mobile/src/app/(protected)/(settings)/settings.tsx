import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { useRouter } from "expo-router";
import {
  AsteriskIcon,
  BellIcon,
  FileTextIcon,
  GlobeIcon,
  HeadsetIcon,
  LinkIcon,
  SunIcon,
  UserIcon,
} from "phosphor-react-native";

import Button from "@/src/components/Button";
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
          title: "Notifications",
          icon: <BellIcon />,
          onPress: () => void 0,
        },
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, padding: 20 }}
    >
      <UserHeader user={session.user} />

      <View className="flex flex-col gap-4">
        {settingsSections.map((section) => (
          <View key={section.title} className="flex flex-col gap-2">
            <Text className="font-sans-semibold text-text text-xs uppercase">
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
    </ScrollView>
  );
}
