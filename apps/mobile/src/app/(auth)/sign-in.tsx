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
import Screen from "@/src/components/Screen";
import { ScreenFooter } from "@/src/components/ScreenFooter";
import { authClient } from "@/src/lib/auth/auth-client";
import { useAuth } from "@/src/lib/auth/use-auth";
import { APP_YEAR } from "@/src/lib/constants/app-version";
import { getUserFacingErrorMessage } from "@/src/lib/errors/user-facing-error";
import { useMessage } from "@/src/lib/messages/message-provider";

type AuthProvider = "github" | "google";

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
  const [loggingInProvider, setLoggingInProvider] =
    useState<AuthProvider | null>(null);
  const isLoggingIn = loggingInProvider !== null;

  useEffect(() => {
    if (session) {
      router.replace("/(protected)/(tabs)");
    }
  }, [router, session]);

  const handleLogin = async (provider: AuthProvider) => {
    if (isLoggingIn) {
      return;
    }

    setLoggingInProvider(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (result.error) {
        showError(getUserFacingErrorMessage(result.error));
      }
    } catch (error) {
      console.error("LOGIN EXCEPTION", error);
      showError(getUserFacingErrorMessage(error));
    } finally {
      setLoggingInProvider(null);
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
              text: "Continue with Google",
              onPress: () => handleLogin("google"),
              disabled: isLoggingIn,
            }}
            secondaryAction={{
              text: "Continue with GitHub",
              onPress: () => handleLogin("github"),
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
              Sign in with Google or GitHub to create your account and sync your
              profile.
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
