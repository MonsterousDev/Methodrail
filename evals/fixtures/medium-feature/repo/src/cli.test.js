import assert from "node:assert/strict";
import test from "node:test";
import { run } from "./cli.js";

test("default greeting", () => {
  assert.equal(run([]), "hi world");
});
