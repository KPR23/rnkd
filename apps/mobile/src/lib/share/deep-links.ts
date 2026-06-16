import { Platform, Share } from "react-native";

import { formatUserDisplayName } from "@/src/lib/user/format-user-display-name";

const APP_SCHEME = "rnkd";

function createAppLink(path: string) {
  return `${APP_SCHEME}://${path.replace(/^\/+/, "")}`;
}

export const appDeepLinks = {
  player: (userId: string) => createAppLink(`/player/${userId}`),
  feedPost: (postId: string) => createAppLink(`/feed/${postId}`),
  group: (groupId: string) => createAppLink(`/group/${groupId}`),
  gameProfile: (gameAccountId: string) =>
    createAppLink(`/game-profile/${gameAccountId}`),
};

type ShareAppLinkOptions = {
  title: string;
  message: string;
  url: string;
};

async function shareAppLink({ title, message, url }: ShareAppLinkOptions) {
  await Share.share(
    Platform.select({
      ios: {
        title,
        url,
      },
      default: {
        title,
        message: `${message}\n${url}`,
      },
    }),
    Platform.select({
      ios: {
        subject: title,
      },
      default: {
        dialogTitle: title,
      },
    }),
  );
}

export async function sharePlayerProfile(user: {
  id: string;
  name: string;
  tag?: string | null;
}) {
  const url = appDeepLinks.player(user.id);
  const displayName = formatUserDisplayName(user);

  await shareAppLink({
    title: "RNKD Player Profile",
    message: `View ${displayName}'s RNKD profile`,
    url,
  });
}

export async function shareFeedPost(post: {
  id: string;
  author: {
    name: string;
    tag?: string | null;
  };
}) {
  const url = appDeepLinks.feedPost(post.id);
  const displayName = formatUserDisplayName(post.author);

  await shareAppLink({
    title: "RNKD Feed Post",
    message: `View ${displayName}'s post on RNKD`,
    url,
  });
}

export async function shareGroup(group: { id: string; name: string }) {
  const url = appDeepLinks.group(group.id);

  await shareAppLink({
    title: "RNKD Group",
    message: `Join or view ${group.name} on RNKD`,
    url,
  });
}

export async function shareGameProfile(gameProfile: {
  id: string;
  label: string;
}) {
  const url = appDeepLinks.gameProfile(gameProfile.id);

  await shareAppLink({
    title: "RNKD Game Profile",
    message: `View ${gameProfile.label} on RNKD`,
    url,
  });
}
