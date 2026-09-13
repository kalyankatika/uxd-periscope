import assert from "node:assert/strict";
import { test } from "node:test";
import {
  initiativeSchema,
  personSchema,
  planSchema,
  type Plan,
} from "../lib/domain";
import {
  movePerson,
  removalImpact,
  removePerson,
  upsertPerson,
} from "../lib/people-management";

function fixture(): Plan {
  const person = (
    id: string,
    managerId: string | null,
    team: string,
    isLeader = false,
  ) =>
    personSchema.parse({
      id,
      name: id === "leader" || id === "peer" ? "Alex Morgan" : id,
      craft: "design",
      managerId,
      team,
      isLeader,
      fte: 1,
      nonProjectPct: 20,
    });
  const project = (
    id: string,
    leadId: string,
    memberIds: string[],
    dependsOn: string[] = [],
  ) =>
    initiativeSchema.parse({
      id,
      name: id,
      leadId,
      memberIds,
      dependsOn,
      owner: "Legacy owner",
      status: "committed",
      start: "2026-10-01",
      end: "2026-12-31",
      effort: { design: 2, research: 0.5, content: 1, design_eng: 0.5 },
    });
  return planSchema.parse({
    people: [
      person("head", null, "UXD", true),
      person("leader", "head", "Product", true),
      person("report", "leader", "Product"),
      person("intern", "report", "Research"),
      person("peer", "head", "Innovation", true),
    ],
    initiatives: [
      project("owned", "leader", ["leader", "report"]),
      project("shared", "peer", ["leader", "intern"], ["owned"]),
      project("report-owned", "report", ["intern"], ["shared"]),
    ],
    revision: 17,
  });
}

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const item of Object.values(value)) freeze(item);
    Object.freeze(value);
  }
  return value;
}

test("People can be added and edited by ID despite identical names", () => {
  const plan = freeze(fixture());
  const added = upsertPerson(plan, {
    ...plan.people[1],
    id: "new",
    managerId: "peer",
  });
  assert.equal(added.people.length, 6);
  assert.deepEqual(
    added.people
      .filter((person) => person.name === "Alex Morgan")
      .map((person) => person.id),
    ["leader", "peer", "new"],
  );
  const edited = upsertPerson(added, {
    ...added.people[1],
    name: "Alex Rivera",
    fte: 0.8,
  });
  assert.equal(
    edited.people.find((person) => person.id === "leader")!.name,
    "Alex Rivera",
  );
  assert.equal(
    edited.people.find((person) => person.id === "peer")!.name,
    "Alex Morgan",
  );
  assert.equal(
    edited.people.find((person) => person.id === "report")!.managerId,
    "leader",
  );
  assert.deepEqual(edited.initiatives, plan.initiatives);
  assert.equal(edited.revision, 17);
  assert.deepEqual(plan, fixture());
});

test("Moves retain nested reporting lines, person fields, and every project relationship", () => {
  const plan = freeze(fixture());
  const moved = movePerson(plan, "leader", "peer");
  assert.deepEqual(
    moved.people,
    plan.people.map((person) =>
      person.id === "leader" ? { ...person, managerId: "peer" } : person,
    ),
  );
  assert.deepEqual(moved.initiatives, plan.initiatives);
  assert.equal(moved.revision, 17);
  assert.deepEqual(plan, fixture());
});

test("Moving to the manager's team includes all descendants but preserves their reporting lines", () => {
  const plan = freeze(fixture());
  const moved = movePerson(plan, "leader", "peer", true);
  assert.deepEqual(
    moved.people,
    plan.people.map((person) => ({
      ...person,
      managerId: person.id === "leader" ? "peer" : person.managerId,
      team: ["leader", "report", "intern"].includes(person.id)
        ? "Innovation"
        : person.team,
    })),
  );
  assert.deepEqual(moved.initiatives, plan.initiatives);
  assert.deepEqual(plan, fixture());
});

test("A hierarchy can move to the top level without losing its team or descendants", () => {
  const plan = freeze(fixture());
  const moved = movePerson(plan, "leader", null);
  assert.deepEqual(
    moved.people,
    plan.people.map((person) =>
      person.id === "leader" ? { ...person, managerId: null } : person,
    ),
  );
  assert.deepEqual(moved.initiatives, plan.initiatives);
  assert.throws(
    () => movePerson(plan, "leader", null, true),
    /Select a manager/,
  );
});

test("Moves and edits reject cycles, self-reporting, and unknown IDs without mutation", () => {
  const plan = freeze(fixture());
  for (const manager of ["leader", "report", "intern"])
    assert.throws(
      () => movePerson(plan, "leader", manager),
      /outside.*reporting hierarchy/,
    );
  for (const manager of ["missing", ""])
    assert.throws(
      () => movePerson(plan, "leader", manager),
      /selected manager.*no longer exists/,
    );
  assert.throws(
    () => movePerson(plan, "missing", null),
    /This person.*no longer exists/,
  );
  assert.throws(
    () => upsertPerson(plan, { ...plan.people[1], managerId: "intern" }),
    /Reporting cycle/,
  );
  assert.throws(
    () => upsertPerson(plan, { ...plan.people[1], managerId: "leader" }),
    /themselves/,
  );
  assert.throws(
    () => upsertPerson(plan, { ...plan.people[1], managerId: "missing" }),
    /selected manager.*no longer exists/,
  );
  assert.throws(
    () => upsertPerson(plan, { ...plan.people[1], managerId: "" }),
    /selected manager.*no longer exists/,
  );
  assert.deepEqual(plan, fixture());
});

test("Removal impact resolves direct reports, owners, and contributors only by ID", () => {
  const plan = freeze(fixture());
  const impact = removalImpact(plan, "leader");
  assert.deepEqual(
    impact.directReports.map((person) => person.id),
    ["report"],
  );
  assert.deepEqual(
    impact.ownedProjects.map((project) => project.id),
    ["owned"],
  );
  assert.deepEqual(
    impact.contributedProjects.map((project) => project.id),
    ["owned", "shared"],
  );
  assert.throws(
    () => removalImpact(plan, "missing"),
    /This person.*no longer exists/,
  );
  assert.deepEqual(plan, fixture());
});

test("Removing a leader reparents direct reports, reassigns ownership, and retains all project details", () => {
  const plan = freeze(fixture());
  const removed = removePerson(plan, "leader", "head", "peer");
  assert.deepEqual(
    removed.people,
    plan.people
      .filter((person) => person.id !== "leader")
      .map((person) =>
        person.id === "report" ? { ...person, managerId: "head" } : person,
      ),
  );
  assert.deepEqual(
    removed.initiatives,
    plan.initiatives.map((project) => ({
      ...project,
      ...(project.id === "owned"
        ? { leadId: "peer", owner: "Alex Morgan" }
        : {}),
      memberIds: project.memberIds.filter((id) => id !== "leader"),
    })),
  );
  assert.equal(removed.revision, 17);
  assert.deepEqual(plan, fixture());
});

test("Removing without replacements clears the legacy owner and promotes only direct reports", () => {
  const plan = freeze(fixture());
  const removed = removePerson(plan, "leader", null, null);
  assert.equal(
    removed.people.find((person) => person.id === "report")!.managerId,
    null,
  );
  assert.equal(
    removed.people.find((person) => person.id === "intern")!.managerId,
    "report",
  );
  const owned = removed.initiatives.find((project) => project.id === "owned")!;
  assert.equal(owned.leadId, null);
  assert.equal(owned.owner, "");
  assert.equal(
    removed.initiatives.find((project) => project.id === "shared")!.owner,
    "Legacy owner",
  );
  assert.deepEqual(plan, fixture());
});

test("A surviving descendant can own projects after its leader is removed", () => {
  const plan = freeze(fixture());
  const removed = removePerson(plan, "leader", "head", "report");
  assert.equal(
    removed.initiatives.find((project) => project.id === "owned")!.leadId,
    "report",
  );
  assert.equal(
    removed.initiatives.find((project) => project.id === "owned")!.owner,
    "report",
  );
});

test("Removal rejects missing, deleted, and cyclic replacement IDs even with no affected records", () => {
  const plan = freeze(fixture());
  for (const reportsTo of ["leader", "report", "intern"])
    assert.throws(
      () => removePerson(plan, "leader", reportsTo, null),
      /outside.*reporting hierarchy/,
    );
  assert.throws(
    () => removePerson(plan, "leader", null, "leader"),
    /will remain/,
  );
  assert.throws(
    () => removePerson(plan, "missing", null, null),
    /This person.*no longer exists/,
  );
  for (const unknown of ["missing", ""]) {
    assert.throws(
      () => removePerson(plan, "intern", unknown, null),
      /selected manager.*no longer exists/,
    );
    assert.throws(
      () => removePerson(plan, "intern", null, unknown),
      /selected project owner.*no longer exists/,
    );
  }
  assert.throws(
    () => removePerson(plan, "intern", null, "intern"),
    /will remain/,
  );
  assert.deepEqual(plan, fixture());
});

test("Operations validate the whole workspace, including unrelated project references", () => {
  const plan = fixture();
  plan.initiatives[0].memberIds.push("missing");
  freeze(plan);
  for (const run of [
    () => upsertPerson(plan, { ...plan.people[1], name: "New name" }),
    () => movePerson(plan, "leader", "peer"),
    () => removePerson(plan, "leader", null, null),
    () => removalImpact(plan, "leader"),
  ])
    assert.throws(run, /Unknown contributor/);
  assert.equal(plan.initiatives[0].memberIds.at(-1), "missing");
});

test("Returned plans and impact records do not share mutable records with their inputs", () => {
  const plan = freeze(fixture());
  for (const result of [
    upsertPerson(plan, { ...plan.people[1], name: "Updated" }),
    movePerson(plan, "leader", "peer"),
    removePerson(plan, "leader", null, null),
  ]) {
    result.people[0].team = "Changed";
    result.initiatives[0].effort.design = 99;
    result.initiatives[1].dependsOn.push("report-owned");
  }
  const impact = removalImpact(plan, "leader");
  impact.directReports[0].name = "Changed";
  impact.ownedProjects[0].effort.design = 99;
  assert.deepEqual(plan, fixture());
});
