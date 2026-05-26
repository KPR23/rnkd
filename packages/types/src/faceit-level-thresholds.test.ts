import assert from "node:assert/strict";
import test from "node:test";

import { getFaceitLevelProgress } from "./faceit-level-thresholds";

test("level 7 at 1448 elo shows progress to level 8", () => {
  const progress = getFaceitLevelProgress(1448);

  assert.equal(progress.level, 7);
  assert.equal(progress.levelStart, 1351);
  assert.equal(progress.levelEnd, 1531);
  assert.equal(progress.pointsToNextLevel, 83);
});
