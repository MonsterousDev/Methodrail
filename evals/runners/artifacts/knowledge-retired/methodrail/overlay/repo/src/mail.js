const v1 = [];
const queue = [];

function sendMail(opts) {
  v1.push(opts);
  return opts;
}

function enqueueMail(opts) {
  queue.push(opts);
  return opts;
}

function handleWelcome(event) {
  return enqueueMail({ template: "welcome", to: event.to, vars: event.vars ?? {} });
}

function handlePasswordReset(event) {
  return enqueueMail({ template: "password-reset", to: event.to, vars: event.vars ?? {} });
}

function v1Count() {
  return v1.length;
}

function queued() {
  return queue.slice();
}

module.exports = {
  sendMail,
  enqueueMail,
  handleWelcome,
  handlePasswordReset,
  v1Count,
  queued,
};
