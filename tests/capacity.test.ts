import { test } from "node:test";
import assert from "node:assert/strict";
import { capacity, level, utilization, weeks } from "../lib/capacity";
import { allocations } from "../lib/allocate";
import { seed, peopleCsv, initiativesCsv } from "../lib/seed";
import { importCsv, exportCsv } from "../lib/csv";
test("12 people provide 9.6 net FTE, research 1.6", () => {
  const p = seed();
  assert.equal(p.people.length, 12);
  assert.equal(p.initiatives.length, 5);
  assert.ok(
    Math.abs(
      capacity(p.people, ["2026-10-05"]).reduce(
        (s, c) => s + c.availableFte,
        0,
      ) - 9.6,
    ) < 1e-9,
  );
  assert.equal(capacity(p.people, ["2026-10-05"])[1].availableFte, 1.6);
});
test("committed October research is 120%; proposed adds demand without mutating plan", () => {
  const p = seed(),
    original = JSON.stringify(p);
  const demand = (items: typeof p.initiatives) =>
    allocations(items, ["2026-10-19"])
      .filter((x) => x.craft === "research")
      .reduce((s, a) => s + a.fte, 0);
  assert.ok(
    Math.abs(
      utilization(
        demand(p.initiatives.filter((i) => i.status === "committed")),
        1.6,
      ) - 1.2,
    ) < 1e-9,
  );
  assert.ok(
    demand(p.initiatives) >
      demand(p.initiatives.filter((i) => i.status === "committed")),
  );
  assert.equal(JSON.stringify(p), original);
});
test("thresholds and zero capacity", () => {
  assert.equal(level(0.8), "green");
  assert.equal(level(1), "amber");
  assert.equal(level(1.01), "red");
  assert.equal(utilization(0, 0), 0);
  assert.equal(utilization(1, 0), Infinity);
});
test("inclusive dates, weekday prorating, no demand outside dates", () => {
  const i = {
    ...seed().initiatives[0],
    start: "2026-10-07",
    end: "2026-10-09",
  };
  assert.equal(allocations([i], ["2026-10-05"])[0].fte, (1.4 * 3) / 5);
  assert.equal(allocations([i], ["2026-10-12"])[0].fte, 0);
  assert.deepEqual(weeks("2026-10-01", "2026-10-05"), [
    "2026-09-28",
    "2026-10-05",
  ]);
});
test("CSV round trips quoted names; rejects invalid and duplicate rows", () => {
  assert.equal(importCsv("people", peopleCsv).length, 12);
  assert.equal(importCsv("initiatives", initiativesCsv).length, 5);
  const p = { ...seed().people[0], name: 'Lee, "Alex"' };
  assert.equal(importCsv("people", exportCsv([p]))[0].name, p.name);
  assert.throws(() => importCsv("people", peopleCsv.replace("1,20", "1,120")));
  assert.throws(() =>
    importCsv("people", peopleCsv + "\np1,Duplicate,design,1,20"),
  );
  assert.throws(() =>
    importCsv(
      "initiatives",
      initiativesCsv.replace("2026-10-01", "2026-02-30"),
    ),
  );
});
