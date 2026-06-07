import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseFaceitLifetimeStats } from "./faceit-lifetime-stats";

describe("parseFaceitLifetimeStats", () => {
  it("parses Faceit lifetime keys", () => {
    const parsed = parseFaceitLifetimeStats({
      Matches: "1325",
      Wins: "676",
      "Win Rate %": "51",
      "Average K/D Ratio": "1.24",
      ADR: "82.5",
      "Average Headshots %": "47",
    });

    assert.deepEqual(parsed, {
      totalMatches: 1325,
      totalWins: 676,
      winRate: 51,
      avgKd: 1.24,
      avgAdr: 82.5,
      avgHsPct: 47,
    });
  });

  it("returns null for empty lifetime payload", () => {
    assert.equal(parseFaceitLifetimeStats(null), null);
    assert.equal(parseFaceitLifetimeStats({}), null);
  });
});
