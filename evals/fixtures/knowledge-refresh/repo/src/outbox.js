const sent = [];
const byKey = new Map();

function dispatchOnce(eventId, channel, body) {
  const hit = byKey.get(eventId);
  if (hit) return hit;
  const row = Object.freeze({
    seq: sent.length,
    eventId,
    channel,
    body,
    status: "sent",
  });
  sent.push(row);
  byKey.set(eventId, row);
  return row;
}

function sendDirect(channel, body) {
  const row = Object.freeze({
    seq: sent.length,
    eventId: null,
    channel,
    body,
    status: "sent",
  });
  sent.push(row);
  return row;
}

function markFailed(eventId) {
  const hit = byKey.get(eventId);
  if (!hit) return null;
  const row = Object.freeze({ ...hit, status: "failed" });
  sent[hit.seq] = row;
  byKey.set(eventId, row);
  return row;
}

function retryFailed() {
  const retried = [];
  for (const row of sent) {
    if (row.status !== "failed" || !row.eventId) continue;
    const next = Object.freeze({ ...row, status: "sent" });
    sent[row.seq] = next;
    byKey.set(row.eventId, next);
    retried.push(next);
  }
  return retried;
}

function deliveries() {
  return sent.slice();
}

module.exports = { dispatchOnce, sendDirect, markFailed, retryFailed, deliveries };
