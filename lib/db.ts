import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { planSchema, type Plan } from "./domain";
import { seed } from "./seed";
const path = process.env.DATABASE_PATH || resolve("data/planner.sqlite");
let instance: DatabaseSync;
function db() {
  if (instance) return instance;
  mkdirSync(dirname(path), { recursive: true });
  instance = new DatabaseSync(path);
  instance.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS metadata(id INTEGER PRIMARY KEY CHECK(id=1),revision INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS people(id TEXT PRIMARY KEY,name TEXT NOT NULL,craft TEXT NOT NULL,fte REAL NOT NULL CHECK(fte BETWEEN 0 AND 1),non_project_pct REAL NOT NULL CHECK(non_project_pct BETWEEN 0 AND 100));
CREATE TABLE IF NOT EXISTS initiatives(id TEXT PRIMARY KEY,name TEXT NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL,status TEXT NOT NULL CHECK(status IN ('proposed','committed','stretch')),effort TEXT NOT NULL);
`);
  if (
    !instance
      .prepare("PRAGMA table_info(people)")
      .all()
      .some((c) => c.name === "details")
  )
    instance.exec(
      "ALTER TABLE people ADD COLUMN details TEXT NOT NULL DEFAULT '{}'",
    );
  if (
    !instance
      .prepare("PRAGMA table_info(initiatives)")
      .all()
      .some((c) => c.name === "details")
  ) {
    instance.exec(
      "ALTER TABLE initiatives ADD COLUMN details TEXT NOT NULL DEFAULT '{}'",
    );
  }
  if (!instance.prepare("SELECT id FROM metadata").get()) {
    instance.exec("BEGIN IMMEDIATE");
    try {
      insert(seed());
      instance.prepare("INSERT INTO metadata VALUES(1,0)").run();
      instance.exec("COMMIT");
    } catch (e) {
      instance.exec("ROLLBACK");
      throw e;
    }
  }
  return instance;
}
function insert(plan: Plan) {
  for (const p of plan.people)
    instance
      .prepare(
        "INSERT INTO people(id,name,craft,fte,non_project_pct,details) VALUES(?,?,?,?,?,?)",
      )
      .run(
        p.id,
        p.name,
        p.craft,
        p.fte,
        p.nonProjectPct,
        JSON.stringify({
          title: p.title,
          team: p.team,
          managerId: p.managerId,
          isLeader: p.isLeader,
        }),
      );
  for (const i of plan.initiatives)
    instance
      .prepare(
        "INSERT INTO initiatives(id,name,start,end,status,effort,details) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        i.id,
        i.name,
        i.start,
        i.end,
        i.status,
        JSON.stringify(i.effort),
        JSON.stringify({
          leadId: i.leadId,
          memberIds: i.memberIds,
          dependsOn: i.dependsOn,
          importance: i.importance,
          health: i.health,
          decision: i.decision,
          update: i.update,
          priority: i.priority,
          owner: i.owner,
          summary: i.summary,
          delivery: i.delivery,
        }),
      );
}
export function readPlan(): Plan {
  const d = db();
  d.exec("BEGIN");
  try {
    const result = planSchema.parse({
      people: d
        .prepare(
          "SELECT id,name,craft,fte,non_project_pct AS nonProjectPct,details FROM people ORDER BY id",
        )
        .all()
        .map((p) => ({ ...p, ...JSON.parse(p.details as string) })),
      initiatives: d
        .prepare("SELECT * FROM initiatives ORDER BY start,id")
        .all()
        .map((i) => ({
          ...i,
          ...JSON.parse(i.details as string),
          effort: JSON.parse(i.effort as string),
        })),
      revision: d.prepare("SELECT revision FROM metadata WHERE id=1").get()!
        .revision,
    });
    d.exec("COMMIT");
    return result;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
export function savePlan(input: unknown): Plan {
  const plan = planSchema.parse(input),
    d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const revision = d
      .prepare("SELECT revision FROM metadata WHERE id=1")
      .get()!.revision;
    if (revision !== plan.revision) throw new Error("CONFLICT");
    d.exec("DELETE FROM people; DELETE FROM initiatives;");
    insert(plan);
    d.prepare("UPDATE metadata SET revision=revision+1 WHERE id=1").run();
    d.exec("COMMIT");
    return { ...plan, revision: plan.revision + 1 };
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
