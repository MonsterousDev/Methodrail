const { sendDirect, countFor } = require("../../outbox");

function handle(event) {
  if (event.type === "legacy.alert" || event.type === "legacy.ping") {
    return sendDirect(event.type, event.data);
  }
  return null;
}

module.exports = { handle, countFor };
