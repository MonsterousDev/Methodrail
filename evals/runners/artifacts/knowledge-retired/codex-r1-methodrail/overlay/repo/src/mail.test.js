const assert = require("node:assert/strict");
const test = require("node:test");
const { handleWelcome, handlePasswordReset, queued, v1Count } = require("./mail");

test("welcome uses enqueueMail with a template id", () => {
  handleWelcome({ to: "ops@lanternmail.test" });
  assert.equal(queued().at(-1).template, "welcome");
  assert.equal(v1Count(), 0);
});

test("password-reset uses enqueueMail with a template id", () => {
  const result = handlePasswordReset({
    to: "ops@lanternmail.test",
    vars: { resetUrl: "https://lanternmail.test/reset/token" },
  });

  assert.deepEqual(result, {
    template: "password-reset",
    to: "ops@lanternmail.test",
    vars: { resetUrl: "https://lanternmail.test/reset/token" },
  });
  assert.equal(queued().at(-1), result);
  assert.equal(v1Count(), 0);
});
