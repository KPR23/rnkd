import assert from "node:assert/strict";
import test from "node:test";

import {
  computeGlobalRsFromScores,
  faceitEloToPoints,
  lolRankToFlexPoints,
  lolRankToSoloPoints,
} from "./rnkd-score-calculations";

test("Iron IV with 0 LP equals 0 RS", () => {
  assert.equal(lolRankToSoloPoints("IRON", "IV", 0), 0);
});

test("Gold I 75 LP equals 1675 solo RS", () => {
  assert.equal(lolRankToSoloPoints("GOLD", "I", 75), 1675);
});

test("Gold I 75 LP flex equals 1172 RS", () => {
  assert.equal(lolRankToFlexPoints("GOLD", "I", 75), 1172);
});

test("global RS sums faceit elo and lol queues", () => {
  assert.equal(
    computeGlobalRsFromScores({
      faceitElo: 1448,
      lolSolo: { tier: "SILVER", rank: "II", leaguePoints: 10 },
      lolFlex: null,
    }),
    1448 + lolRankToSoloPoints("SILVER", "II", 10),
  );
});

test("faceit elo to points clamps invalid values to zero", () => {
  assert.equal(faceitEloToPoints(null), 0);
  assert.equal(faceitEloToPoints(undefined), 0);
  assert.equal(faceitEloToPoints(-50), 0);
  assert.equal(faceitEloToPoints(1448.9), 1448);
});

test("computeGlobalRsFromScores sums all configured sources", () => {
  const solo = { tier: "GOLD", rank: "I", leaguePoints: 75 };
  const flex = { tier: "SILVER", rank: "II", leaguePoints: 10 };

  assert.equal(
    computeGlobalRsFromScores({
      faceitElo: 1000,
      lolSolo: solo,
      lolFlex: flex,
    }),
    1000 +
      lolRankToSoloPoints(solo.tier, solo.rank, solo.leaguePoints) +
      lolRankToFlexPoints(flex.tier, flex.rank, flex.leaguePoints),
  );
});

test("computeGlobalRsFromScores handles missing game data", () => {
  assert.equal(
    computeGlobalRsFromScores({
      faceitElo: null,
      lolSolo: null,
      lolFlex: null,
    }),
    0,
  );
});

test("lol flex points equal seventy percent of solo points", () => {
  const soloPoints = lolRankToSoloPoints("PLATINUM", "III", 42);
  assert.equal(lolRankToFlexPoints("PLATINUM", "III", 42), Math.floor(soloPoints * 0.7));
});
