import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectCsv, exportCsv } from "../lib/csv";
import { previewWorkspaceImport } from "../lib/import-preview";
import { leadershipDemo } from "../lib/leadership-demo";
import { leaderProjects } from "../lib/work-graph";
import type { Plan } from "../lib/domain";

test("Combined import saves both datasets once, resolves graph identities, and rejects stale or invalid replacements without partial writes", async () => {
  const directory = mkdtempSync(join(tmpdir(), "periscope-organization-api-"));
  process.env.DATABASE_PATH = join(directory, "plan.sqlite");
  try {
    const { GET, PUT } = await import("../app/api/plan/route");
    const { GET: graphGET } = await import("../app/api/graph/route");
    const initial: Plan = await (await GET()).json();
    const organization = leadershipDemo();
    const preview = previewWorkspaceImport(
      initial,
      {
        people: inspectCsv("people", exportCsv(organization.people)),
        initiatives: inspectCsv(
          "initiatives",
          exportCsv(
            organization.initiatives.map(({ effort, ...project }) => ({
              ...project,
              ...effort,
            })),
          ),
        ),
      },
      true,
    );
    assert.deepEqual(preview.errors, []);
    assert.deepEqual(
      await (await GET()).json(),
      initial,
      "review is read-only",
    );
    const request = (plan: Plan) =>
      new Request("http://127.0.0.1:3000/api/plan", {
        method: "PUT",
        headers: {
          origin: "http://127.0.0.1:3000",
          "content-type": "application/json",
        },
        body: JSON.stringify(plan),
      });
    const response = await PUT(request(preview.plan));
    assert.equal(response.status, 200);
    const saved: Plan = await (await GET()).json();
    assert.equal(
      saved.revision,
      initial.revision + 1,
      "one revision for both datasets",
    );
    assert.deepEqual(
      new Set(saved.people.map((p) => p.id)),
      new Set(organization.people.map((p) => p.id)),
    );
    assert.deepEqual(
      new Set(saved.initiatives.map((p) => p.id)),
      new Set(organization.initiatives.map((p) => p.id)),
    );
    const graph = await graphGET().json();
    const serialized = JSON.stringify(graph);
    assert.ok(serialized.includes("urn:periscope:person:riley"));
    assert.ok(serialized.includes("urn:periscope:project:ai-standards"));
    assert.ok(
      leaderProjects(saved, "riley").some((p) => p.id === "ai-standards"),
    );

    assert.equal((await PUT(request(preview.plan))).status, 409);
    assert.deepEqual(
      await (await GET()).json(),
      saved,
      "stale import preserves both datasets",
    );
    const invalid = {
      ...saved,
      people: saved.people.filter((p) => p.id !== "aisha"),
    };
    assert.equal((await PUT(request(invalid))).status, 400);
    assert.deepEqual(
      await (await GET()).json(),
      saved,
      "invalid import cannot partially replace people",
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
