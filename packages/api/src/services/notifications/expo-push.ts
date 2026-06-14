import { eq } from "drizzle-orm";

import { db, pushTokens } from "@repo/db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
};

function isExpoPushToken(token: string) {
  return (
    token.startsWith("ExpoPushToken[") || token.startsWith("ExponentPushToken[")
  );
}

async function sendExpoPushMessages(messages: ExpoPushMessage[]) {
  if (messages.length === 0) {
    return;
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      console.warn(
        `Expo push request failed with ${response.status}: ${await response.text()}`,
      );
    }
  } catch (error) {
    console.warn("Expo push request failed", error);
  }
}

export async function sendFriendRequestNotification({
  recipientUserId,
  requesterUserId,
  requesterName,
}: {
  recipientUserId: string;
  requesterUserId: string;
  requesterName: string;
}) {
  const tokens = await db
    .select({ token: pushTokens.token })
    .from(pushTokens)
    .where(eq(pushTokens.userId, recipientUserId));

  await sendExpoPushMessages(
    tokens
      .map(({ token }) => token)
      .filter(isExpoPushToken)
      .map((token) => ({
        to: token,
        title: "New friend request",
        body: `${requesterName} added you as a friend.`,
        data: {
          type: "friend_request",
          requesterUserId,
        },
        sound: "default",
      })),
  );
}
