import React from "react";
import { SvgUri } from "react-native-svg";
import { Asset } from "expo-asset";
import { COMMUNITY_DRAGON_BASE } from "@/app/constants/riotApiUrl";

type EmblemKey =
	| "iron"
	| "bronze"
	| "silver"
	| "gold"
	| "platinum"
	| "emerald"
	| "diamond"
	| "master"
	| "grandmaster"
	| "challenger";

const EMBLEM_SCALES: Partial<Record<EmblemKey, number>> = {};

const EMBLEM_ASSETS: Record<EmblemKey, number> = {
	iron: require("../../../assets/riot/rank-emblems/iron.svg"),
	bronze: require("../../../assets/riot/rank-emblems/bronze.svg"),
	silver: require("../../../assets/riot/rank-emblems/silver.svg"),
	gold: require("../../../assets/riot/rank-emblems/gold.svg"),
	platinum: require("../../../assets/riot/rank-emblems/platinum.svg"),
	emerald: require("../../../assets/riot/rank-emblems/emerald.svg"),
	diamond: require("../../../assets/riot/rank-emblems/diamond.svg"),
	master: require("../../../assets/riot/rank-emblems/master.svg"),
	grandmaster: require("../../../assets/riot/rank-emblems/grandmaster.svg"),
	challenger: require("../../../assets/riot/rank-emblems/challenger.svg"),
};

const uriCache: Partial<Record<EmblemKey, string>> = {};

export default function RankEmblem({ tier }: { tier: string }) {
	const maybeKey = tier.toLowerCase();
	if (!(maybeKey in EMBLEM_ASSETS)) return null;
	const key = maybeKey as EmblemKey;
	const scale = EMBLEM_SCALES[key] ?? 1;

	const fallbackUri = `${COMMUNITY_DRAGON_BASE}/${key}.svg`;
	const [localUri, setLocalUri] = React.useState<string | null>(uriCache[key] ?? null);

	React.useEffect(() => {
		if (uriCache[key]) {
			setLocalUri(uriCache[key] ?? null);
			return;
		}

		const moduleId = EMBLEM_ASSETS[key];
		const asset = Asset.fromModule(moduleId);

		void asset
			.downloadAsync()
			.then(() => {
				const resolved = asset.localUri ?? asset.uri;
				if (resolved) {
					uriCache[key] = resolved;
					setLocalUri(resolved);
				} else {
					setLocalUri(null);
				}
			})
			.catch(() => setLocalUri(null));
	}, [key]);

	const uri = localUri ?? fallbackUri;

	return <SvgUri uri={uri} width={42 * scale} height={42 * scale} />;
}
