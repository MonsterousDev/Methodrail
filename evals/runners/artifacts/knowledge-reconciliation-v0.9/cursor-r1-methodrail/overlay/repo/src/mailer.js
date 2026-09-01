const sent = new Map();
const outbox = [];

function backoffMs() {
  return 5000;
}

function isCustomerMail(event) {
  return Boolean(event && event.type === "ticket.closed");
}

function handle(event) {
  if (!event || !event.id) return null;
  if (!isCustomerMail(event)) return null;
  if (sent.has(event.id)) return sent.get(event.id);
  const row = {
    eventId: event.id,
    type: event.type,
    retryAt: Date.now() + backoffMs(),
  };
  sent.set(event.id, row);
  outbox.push(row);
  return row;
}

function failSend(eventId) {
  const row = outbox.find((item) => item.eventId === eventId);
  if (row) row.failed = true;
}

function countFor(type) {
  return outbox.filter((row) => row.type === type).length;
}

function verifyRetryClosed() {
  const event = { id: "evt-closed-1", type: "ticket.closed" };
  const queued = handle(event);
  if (!queued) throw new Error("ticket.closed customer mail was not queued");
  if (queued.eventId !== event.id) throw new Error("mail must be keyed on event.id");
  if (handle(event) !== queued) throw new Error("same event.id must not enqueue twice");
  if (handle({ id: "evt-other", type: "ticket.opened" }) !== null) {
    throw new Error("only ticket.closed is customer mail");
  }

  const beforeFail = outbox.length;
  failSend(event.id);
  const failed = outbox.find((item) => item.eventId === event.id);
  if (outbox.length !== beforeFail) throw new Error("failed send must stay in the outbox");
  if (!failed || failed.failed !== true) throw new Error("failed send was not marked failed");
  if (!(failed.retryAt > Date.now())) {
    throw new Error("failed ticket.closed mail must wait (backoff), not retry immediately");
  }
  if (backoffMs() !== 5000) throw new Error("expected 5000ms backoff");
  if (countFor("ticket.closed") !== 1) throw new Error("expected one ticket.closed mail");
  console.log("retry-closed ok");
}

if (require.main === module) {
  verifyRetryClosed();
}

module.exports = { handle, failSend, countFor, backoffMs, outbox };
