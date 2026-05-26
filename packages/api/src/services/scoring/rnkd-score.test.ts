import assert from "node:assert/strict";
import test from "node:test";

import {
  computeGlobalRsFromScores,
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
