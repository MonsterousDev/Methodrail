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
  byKey.delete(eventId);
  sent.splice(hit.seq, 1);
  return hit;
}

function deliveries() {
  return sent.slice();
}

module.exports = { dispatchOnce, sendDirect, markFailed, deliveries };
