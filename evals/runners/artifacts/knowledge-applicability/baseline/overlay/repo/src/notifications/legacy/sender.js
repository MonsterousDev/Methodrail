const { dispatchOnce, sendDirect, countFor } = require("../../outbox");

function handle(event) {
  if (event.type === "legacy.alert") {
    return sendDirect(event.type, event.data);
  }
  if (event.type === "legacy.ping") {
    return dispatchOnce(event.id, event.type, event.data);
  }
  return null;
}

module.exports = { handle, countFor };
