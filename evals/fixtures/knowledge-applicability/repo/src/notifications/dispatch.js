const { dispatchOnce, countFor } = require("../outbox");

function handle(event) {
  if (event.type === "notice.created") {
    return dispatchOnce(event.id, event.type, event.data);
  }
  return null;
}

module.exports = { handle, countFor };
