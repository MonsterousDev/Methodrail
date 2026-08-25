const { sendDirect, deliveries } = require("./outbox");

function handle(event) {
  if (event.type === "ticket.opened") {
    const { dispatchOnce } = require("./outbox");
    return dispatchOnce(event.id, event.type, event.data);
  }
  if (event.type === "ticket.resolved") {
    return sendDirect(event.type, event.data);
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
  const { markFailed } = require("./outbox");
  return markFailed(eventId);
}

module.exports = { handle, countFor, failSend, deliveries };
