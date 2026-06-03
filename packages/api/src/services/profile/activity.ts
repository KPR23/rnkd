import {
  buildMatchActivityGrid,
  getMatchActivityDatesForUser,
} from "../../repositories/match-history.repo";

const ACTIVITY_DAYS = 90;

export async function getMatchActivity(userId: string) {
  const activeDays = await getMatchActivityDatesForUser(userId, ACTIVITY_DAYS);
  return buildMatchActivityGrid(activeDays, ACTIVITY_DAYS);
}
