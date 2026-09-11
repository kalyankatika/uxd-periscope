import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
test("API validates writes, enforces origin, persists changes, and reports revision conflicts", async () => {
  const directory = mkdtempSync(join(tmpdir(), "periscope-api-"));
  process.env.DATABASE_PATH = join(directory, "plan.sqlite");
  try {
    const { GET, PUT } = await import("../app/api/plan/route");
    const initial = await (await GET()).json();
    const request = (body: unknown, origin = "http://localhost:3000") =>
      new Request("http://localhost:3000/api/plan", {
        method: "PUT",
        headers: { origin, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.equal(
      (await PUT(request(initial, "https://elsewhere.example"))).status,
      403,
    );
    assert.equal(
      (
        await PUT(
          request({ ...initial, people: [{ ...initial.people[0], fte: 2 }] }),
        )
      ).status,
      400,
    );
    assert.deepEqual(await (await GET()).json(), initial);
    const next = {
      ...initial,
      initiatives: [
        ...initial.initiatives,
        {
          ...initial.initiatives[0],
          id: "intake",
          name: "Intake proposal",
          status: "proposed",
        },
      ],
    };
    const localRequest = new Request("http://localhost:3000/api/plan", {
      method: "PUT",
      headers: {
        origin: "http://127.0.0.1:3000",
        host: "127.0.0.1:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify(next),
    });
    const saved = await PUT(localRequest);
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).revision, 1);
    assert.equal((await (await GET()).json()).initiatives.length, 6);
    assert.equal((await PUT(request(initial))).status, 409);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
