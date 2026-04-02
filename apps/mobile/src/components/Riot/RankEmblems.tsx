import React from "react";
import { SvgXml } from "react-native-svg";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";

type EmblemKey =
	| "unranked"
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

const EMBLEM_ASSETS: Record<EmblemKey, number> = {
	unranked: require("../../../assets/riot/rank-emblems/unranked.svg"),
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

const xmlCache: Partial<Record<EmblemKey, string>> = {};

export default function RankEmblem({ tier }: { tier: string }) {
	const maybeKey = tier.toLowerCase();
	const key = (maybeKey in EMBLEM_ASSETS ? maybeKey : null) as EmblemKey | null;

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
				const asset = Asset.fromModule(EMBLEM_ASSETS[key]);
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
				console.error("Failed to load rank emblem:", error);
			}
		};

		void loadSvg();

		return () => {
			cancelled = true;
		};
	}, [key]);

	if (!key || !xml) return null;

	return <SvgXml xml={xml} width={42} height={42} />;
}
