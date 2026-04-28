import { SvgXml } from "react-native-svg";

import { getFaceitLevelBadgeSvg } from "@repo/ui/faceit-level-badges";

export default function FaceitLevelBadge({
  level,
  size = 32,
}: {
  level: number | null | undefined;
  size?: number;
}) {
  const xml = getFaceitLevelBadgeSvg(level);

  if (!xml) return null;

  return <SvgXml xml={xml} width={size} height={size} />;
}
