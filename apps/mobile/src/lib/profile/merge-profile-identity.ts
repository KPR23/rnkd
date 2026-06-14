import type { User } from "@repo/types";

type ProfileIdentity = {
  name: string;
  tag: string | null;
  image: string | null;
};

export function mergeProfileIdentity(
  sessionUser: User,
  profileUser?: ProfileIdentity | null,
): User {
  if (!profileUser) {
    return sessionUser;
  }

  return {
    ...sessionUser,
    name: profileUser.name,
    tag: profileUser.tag ?? sessionUser.tag,
    image: profileUser.image ?? sessionUser.image,
  };
}
