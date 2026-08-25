"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const app = require("../examples/hello");

test("hello example can be required without listening", () => {
  assert.equal(typeof app, "function");
});
