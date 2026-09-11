import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { seed } from "../lib/seed";
import { importCsv, exportCsv } from "../lib/csv";
test("Legacy SQLite plans migrate without losing data; project context survives saves", async () => {
  const dir = mkdtempSync(join(tmpdir(), "periscope-legacy-"));
  process.env.DATABASE_PATH = join(dir, "legacy.sqlite");
  const db = new DatabaseSync(process.env.DATABASE_PATH);
  db.exec(
    `CREATE TABLE metadata(id INTEGER PRIMARY KEY, revision INTEGER);INSERT INTO metadata VALUES(1,4);CREATE TABLE people(id TEXT PRIMARY KEY,name TEXT,craft TEXT,fte REAL,non_project_pct REAL);CREATE TABLE initiatives(id TEXT PRIMARY KEY,name TEXT,start TEXT,end TEXT,status TEXT,effort TEXT);`,
  );
  const old = seed();
  for (const p of old.people)
    db.prepare("INSERT INTO people VALUES(?,?,?,?,?)").run(
      p.id,
      p.name,
      p.craft,
      p.fte,
      p.nonProjectPct,
    );
  for (const i of old.initiatives)
    db.prepare("INSERT INTO initiatives VALUES(?,?,?,?,?,?)").run(
      i.id,
      i.name,
      i.start,
      i.end,
      i.status,
      JSON.stringify(i.effort),
    );
  db.close();
  try {
    const { readPlan, savePlan } = await import("../lib/db");
    const migrated = readPlan();
    assert.equal(migrated.revision, 4);
    assert.deepEqual(
      migrated.people,
      old.people.sort((a, b) => a.id.localeCompare(b.id)),
    );
    assert.equal(migrated.initiatives.length, 5);
    assert.equal(migrated.initiatives[0].priority, "");
    assert.equal(migrated.initiatives[0].delivery, "planned");
    const next = {
      ...migrated,
      initiatives: migrated.initiatives.map((i) => ({
        ...i,
        priority: "Client confidence",
        owner: "Project lead",
        summary: "Improve onboarding comprehension",
        delivery: "in_progress" as const,
      })),
    };
    savePlan(next);
    assert.deepEqual(readPlan(), { ...next, revision: 5 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
test("Project context round trips through CSV; legacy imports retain safe defaults", () => {
  const i = {
    ...seed().initiatives[0],
    priority: "Client confidence",
    owner: "Maya Chen",
    summary: "Validate, then simplify.",
    delivery: "blocked" as const,
  };
  const { effort, ...rest } = i;
  const parsed = importCsv("initiatives", exportCsv([{ ...rest, ...effort }]));
  assert.deepEqual(parsed, [i]);
  assert.throws(() =>
    importCsv(
      "initiatives",
      exportCsv([{ ...rest, ...effort, delivery: "unknown" }]),
    ),
  );
});
