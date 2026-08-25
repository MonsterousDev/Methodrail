const { dispatchOnce, markFailed, deliveries } = require("./outbox");

function handle(event) {
  if (event.type === "ticket.opened") {
    return dispatchOnce(event.id, event.type, event.data);
  }
  return null;
}

function countFor(channel) {
  let n = 0;
  for (const row of deliveries()) {
    if (row.channel === channel) n += 1;
  }
  return n;
}

function failSend(eventId) {
  return markFailed(eventId);
}

module.exports = { handle, countFor, failSend, deliveries };
