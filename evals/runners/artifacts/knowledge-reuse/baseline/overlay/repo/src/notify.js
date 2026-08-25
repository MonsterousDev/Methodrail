const { dispatchOnce, sendDirect, deliveries } = require("./outbox");

function handle(event) {
  if (event.type === "shipment.created") {
    return dispatchOnce(event.id, event.type, event.data);
  }
  if (event.type === "shipment.delayed") {
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

module.exports = { handle, countFor, deliveries };
