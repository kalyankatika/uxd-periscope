import test from "node:test";
import assert from "node:assert/strict";
import { timelinePosition } from "../lib/timeline";
test("timeline clips crossing dates, includes one-day work and excludes outside work", () => {
  assert.deepEqual(timelinePosition("2026-09-01", "2026-11-01", "2026-10-01", "2026-10-10"), {left: 0, width: 100});
  assert.deepEqual(timelinePosition("2026-10-10", "2026-10-10", "2026-10-01", "2026-10-10"), {left: 90, width: 10});
  assert.equal(timelinePosition("2026-11-01", "2026-11-02", "2026-10-01", "2026-10-10"), null);
});
