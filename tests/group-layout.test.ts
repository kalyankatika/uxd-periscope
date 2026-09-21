import test from "node:test";
import assert from "node:assert/strict";
import { fillGroupWidth } from "../lib/group-layout";
test("group overview fills width while retaining vertical bounds and identity", () => {
  const original = {nodes: [], groups: [{id:"a",label:"A",subtitle:"",x:0,y:0,width:500,height:1200,projectCount:0,peopleCount:0}]};
  const result = fillGroupWidth(original, 900, 660);
  const k = (900 - 32) / result.groups[0].width;
  assert.equal(result.groups[0].width * k, 868);
  assert.ok(result.groups[0].height * k <= 470.001);
  assert.equal(original.groups[0].width, 500);
  assert.equal(fillGroupWidth(original, 390, 540), original);
});
