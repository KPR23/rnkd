import { db, follows } from "@repo/db";
import { eq } from "drizzle-orm";
import { RiotParticipant } from "./riot/types";

export async function getFollowedAccounts(userId: string) {
	const followedAccounts = await db.query.follows.findMany({
		where: eq(follows.followerUserId, userId),
	});

	return followedAccounts;
}

export function getParticipantCs(participant: RiotParticipant) {
	return (
		(participant.totalMinionsKilled ?? 0) +
		(participant.neutralMinionsKilled ?? 0)
	);
}

export function getChampionIconUrl(championName: string) {
	//TODO
	const version = "16.4.1";

	return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}
