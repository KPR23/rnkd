import { Share } from "react-native";

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

export async function sharePlayerProfile(user: {
  id: string;
  name: string;
  tag?: string | null;
}) {
  const url = appDeepLinks.player(user.id);

  await Share.share({
    message: url,
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

  await Share.share({
    message: url,
    url,
  });
}

export async function shareGroup(group: { id: string; name: string }) {
  const url = appDeepLinks.group(group.id);

  await Share.share({
    message: url,
    url,
  });
}

export async function shareGameProfile(gameProfile: {
  id: string;
  label: string;
}) {
  const url = appDeepLinks.gameProfile(gameProfile.id);

  await Share.share({
    message: url,
    url,
  });
}
