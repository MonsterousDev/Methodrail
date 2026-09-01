const sent = new Map();
const outbox = [];

function backoffMs() {
  return 5000;
}

function handle(event) {
  if (!event || !event.id) return null;
  if (event.type !== "ticket.closed") return null;
  if (sent.has(event.id)) return sent.get(event.id);
  const row = { eventId: event.id, type: event.type, retryAt: Date.now() + backoffMs() };
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) row.failed = true;
}

function retry(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (!row || !row.failed) return null;
  const now = Date.now();
  if (now < row.retryAt) {
    return { status: "wait", waitMs: row.retryAt - now, row };
  }
  row.failed = false;
  row.retryAt = now + backoffMs();
  return { status: "sent", row };
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

module.exports = { handle, failSend, retry, countFor, backoffMs, outbox };
