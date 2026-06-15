import { useEffect, useState, type ComponentType } from "react";
import { Image, ScrollView, View } from "react-native";

import { useRouter } from "expo-router";
import {
  ChartLineUpIcon,
  IconContext,
  MagnifyingGlassIcon,
  NewspaperIcon,
  UsersIcon,
  type IconProps,
} from "phosphor-react-native";

import { colors } from "@repo/ui/colors";
import AppText from "@/src/components/AppText";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import Screen from "@/src/components/Screen";
import { APP_YEAR } from "@/src/lib/constants/app-version";
import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { useMessage } from "@/src/lib/messages/message-provider";

type Feature = {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  color: string;
};

const features: Feature[] = [
  {
    title: "Feed",
    description:
      "Follow posts, friend activity, and incoming requests in one timeline.",
    icon: NewspaperIcon,
    color: colors.primary,
  },
  {
    title: "Groups",
    description:
      "Create or join groups, share invite codes, and track your ranking.",
    icon: UsersIcon,
    color: colors.gamesCS2,
  },
  {
    title: "Search",
    description: "Find players, teams, and games across the community.",
    icon: MagnifyingGlassIcon,
    color: "#3B82F6",
  },
  {
    title: "Profile",
    description:
      "Connect game accounts, view ratings, and monitor match activity.",
    icon: ChartLineUpIcon,
    color: colors.gamesLoL,
  },
];

function FeatureCard({ title, description, icon: Icon, color }: Feature) {
  return (
    <View className="border-muted bg-card flex-row gap-3 border px-4 py-4">
      <View
        className="size-10 items-center justify-center"
        style={{ backgroundColor: `${color}1A` }}
      >
        <Icon size={20} color={color} weight="bold" />
      </View>
      <View className="flex-1 gap-1">
        <AppText className="text-base leading-5.5" weight="medium">
          {title}
        </AppText>
        <AppText className="text-sm leading-5" color={colors.textSecondary}>
          {description}
        </AppText>
      </View>
    </View>
  );
}

export default function SignInScreen() {
  const router = useRouter();
  const { data: session } = useAuth();
  const { showError } = useMessage();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (session) {
      router.replace("/(protected)/(tabs)");
    }
  }, [router, session]);

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });

      if (result.error) {
        showError(
          result.error.message || `HTTP ${result.error.status ?? "unknown"}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("LOGIN EXCEPTION", error);
      showError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <IconContext.Provider
      value={{ size: 20, color: colors.text, weight: "regular" }}
    >
      <Screen
        safeAreaEdges={["top", "bottom"]}
        footer={
          <ScreenFooter
            loading={isLoggingIn}
            primaryAction={{
              text: "Continue with GitHub",
              onPress: handleLogin,
              disabled: isLoggingIn,
            }}
          />
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 24, paddingBottom: 16, paddingTop: 8 }}
        >
          <View className="items-center gap-4 pt-4">
            <Image
              source={require("../../../assets/rnkd.png")}
              className="size-20"
              resizeMode="contain"
            />
            <View className="items-center gap-2">
              <AppText className="text-[32px] leading-9" weight="medium">
                RNKD
              </AppText>
              <AppText
                className="max-w-70 text-center text-base leading-6"
                color={colors.textSecondary}
              >
                Track your gaming activity, compete in groups, and stay
                connected with your squad.
              </AppText>
            </View>
          </View>

          <View className="gap-2.5">
            <AppText
              className="text-sm leading-5"
              color={colors.textSecondary}
              weight="medium"
            >
              What you can do
            </AppText>
            <View className="gap-2.5">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </View>
          </View>

          <View className="items-center gap-1 pb-2">
            <AppText
              className="max-w-75 text-center text-sm leading-5"
              color={colors.textSecondary}
            >
              Sign in with GitHub to create your account and sync your profile.
            </AppText>
            <AppText className="text-text-muted text-center text-sm">
              © {APP_YEAR} KPR&apos;s Lab
            </AppText>
          </View>
        </ScrollView>
      </Screen>
    </IconContext.Provider>
  );
}
