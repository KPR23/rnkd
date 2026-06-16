"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const signInWithGithub = async () => {
  await authClient.signIn.social({
    provider: "github",
  });
};

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};

export const { signIn, signUp, useSession } = authClient;
