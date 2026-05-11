import { isCs2FaceitGameAccount } from "@repo/types";
import { type GameProfilePanelProps } from "@/src/components/GameProfileRegistry";
import ProfileGameStatCard from "@/src/components/ProfileGameStatCard";

export default function Cs2FaceitProfilePanel({
  gameAccount,
}: GameProfilePanelProps) {
  if (!isCs2FaceitGameAccount(gameAccount)) {
    return null;
  }

  return <ProfileGameStatCard gameAccount={gameAccount} />;
}
