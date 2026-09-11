import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("SQLite saves, rejects stale revisions and invalid writes without changing the plan", async () => {
  const directory = mkdtempSync(join(tmpdir(), "periscope-test-"));
  process.env.DATABASE_PATH = join(directory, "plan.sqlite");
  try {
    const { readPlan, savePlan } = await import("../lib/db");
    const first = readPlan();
    assert.equal(first.people.length, 12);
    const updated = savePlan({
      ...first,
      people: first.people.map((person, index) =>
        index === 0
          ? {
              ...person,
              title: "Design lead",
              team: "Client experience",
              managerId: first.people[1].id,
              isLeader: true,
            }
          : person,
      ),
      initiatives: first.initiatives.map((i, index) =>
        index === 0
          ? {
              ...i,
              name: "Revised initiative",
              leadId: first.people[0].id,
              memberIds: [first.people[1].id],
              dependsOn: [first.initiatives[1].id],
              importance: "top",
              health: "needs_decision",
              decision: "Confirm launch scope",
              update: "Research complete",
            }
          : i,
      ),
    });
    assert.equal(updated.revision, 1);
    assert.equal(readPlan().initiatives[0].name, "Revised initiative");
    assert.throws(() => savePlan(first), /CONFLICT/);
    assert.throws(() =>
      savePlan({ ...updated, people: [{ ...updated.people[0], fte: -1 }] }),
    );
    assert.deepEqual(readPlan(), updated);
    const deleted = savePlan({
      ...updated,
      initiatives: updated.initiatives.slice(1),
    });
    assert.equal(readPlan().initiatives.length, 4);
    assert.equal(deleted.revision, 2);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
