import type { Router } from "expo-router";

export const GROUPS_TAB_HREF = "/(protected)/(tabs)/groups" as const;

export function openGroupFromGroupsTab(router: Router, groupId: string) {
  router.push({
    pathname: "/group/[id]",
    params: { id: groupId },
  });
}

export function openGroupAfterWizard(router: Router, groupId: string) {
  router.dismissTo(GROUPS_TAB_HREF);
  router.push({
    pathname: "/group/[id]",
    params: { id: groupId, returnTo: "groups" },
  });
}

export function goBackFromGroup(router: Router, returnTo?: string) {
  if (returnTo === "groups") {
    router.dismissTo(GROUPS_TAB_HREF);
    return;
  }

  router.back();
}
