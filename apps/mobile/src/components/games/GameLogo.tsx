import React from "react";

import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { SvgXml } from "react-native-svg";

import { GAMES } from "@repo/types";

type LogoKey = typeof GAMES.LOL | typeof GAMES.CS2_FACEIT;

const GAME_LOGO_ASSETS: Record<LogoKey, number> = {
  [GAMES.LOL]: require("../../../assets/games/LeagueOfLegendsLogo.svg"),
  [GAMES.CS2_FACEIT]: require("../../../assets/games/CounterStrikeLogo.svg"),
};

const GAME_LOGO_LAYOUT: Record<LogoKey, { width: number; height: number }> = {
  [GAMES.LOL]: { width: 74, height: 28 },
  [GAMES.CS2_FACEIT]: { width: 66, height: 28 },
};

const xmlCache: Partial<Record<LogoKey, string>> = {};

const DEFAULT_LOGO_COLOR = "#F5F2F5";

function logoKeyFromGameId(gameId: string): LogoKey | null {
  if (gameId === GAMES.LOL || gameId === GAMES.CS2_FACEIT) {
    return gameId;
  }
  return null;
}

export default function GameLogo({
  gameId,
  maxHeight = 22,
  color = DEFAULT_LOGO_COLOR,
}: {
  gameId: string;
  maxHeight?: number;
  color?: string;
}) {
  const key = logoKeyFromGameId(gameId);
  const [xml, setXml] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!key) {
      setXml(null);
      return;
    }

    const cached = xmlCache[key];
    if (cached) {
      setXml(cached);
      return;
    }

    setXml(null);

    let cancelled = false;

    const loadSvg = async () => {
      try {
        const asset = Asset.fromModule(GAME_LOGO_ASSETS[key]);
        await asset.downloadAsync();
        const uri = asset.localUri ?? asset.uri;

        if (uri) {
          const content = await FileSystem.readAsStringAsync(uri);
          xmlCache[key] = content;
          if (!cancelled) {
            setXml(content);
          }
        }
      } catch (error) {
        console.error("Failed to load game logo:", error);
      }
    };

    void loadSvg();

    return () => {
      cancelled = true;
    };
  }, [key]);

  if (!key || !xml) return null;

  const { width: vw, height: vh } = GAME_LOGO_LAYOUT[key];
  const height = maxHeight;
  const width = Math.round((vw / vh) * maxHeight);

  return <SvgXml xml={xml} width={width} height={height} color={color} />;
}
