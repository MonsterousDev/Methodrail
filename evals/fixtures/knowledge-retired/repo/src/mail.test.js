const assert = require("node:assert/strict");
const test = require("node:test");
const { handleWelcome, handlePasswordReset, queued, v1Count } = require("./mail");

test("welcome uses enqueueMail with a template id", () => {
  handleWelcome({ to: "ops@lanternmail.test" });
  assert.equal(queued().at(-1).template, "welcome");
  assert.equal(v1Count(), 0);
});

test("password-reset is not wired yet", () => {
  assert.equal(handlePasswordReset({ to: "ops@lanternmail.test" }), null);
});
