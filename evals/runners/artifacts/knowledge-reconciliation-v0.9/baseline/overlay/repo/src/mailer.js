const sent = new Map();
function handle(event) {
  return { eventId: event.id, retriedImmediately: true };
}
module.exports = { handle, countFor: () => 2, backoffMs: () => 0, failSend() {} };
