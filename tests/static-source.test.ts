import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseStaticPlan, resolveDataUrl, staticSourceSchema } from "../lib/static-source";
const fixture = () => JSON.parse(readFileSync(new URL("../examples/uxd-demo/workspace.json", import.meta.url), "utf8"));
test("static JSON uses existing validated IDs and reference contract", () => {
  const plan = parseStaticPlan(fixture());
  assert.equal(plan.people.length, 27);
  const broken = fixture(); broken.people[1].managerId = "missing";
  assert.throws(() => parseStaticPlan(broken), /Invalid workspace data/);
  const badStatus = fixture(); badStatus.initiatives[0].status = "mystery";
  assert.throws(() => parseStaticPlan(badStatus), /Invalid workspace data/);
});
test("source URLs resolve under deployment prefix and reject embedded credentials", () => {
  const source = staticSourceSchema.parse({dataUrl:"./workspace.json",label:"Example"});
  assert.equal(resolveDataUrl(source, "https://example.test/periscope/data/config.json"),"https://example.test/periscope/data/workspace.json");
  assert.equal(resolveDataUrl({...source,dataUrl:"https://api.example.test/workspace"}, "https://example.test/data/config.json"),"https://api.example.test/workspace");
  assert.throws(() => resolveDataUrl({...source,dataUrl:"javascript:alert(1)"}, "https://example.test/"));
  assert.throws(() => resolveDataUrl({...source,dataUrl:"https://user:pass@example.test/data"}, "https://example.test/"));
});
