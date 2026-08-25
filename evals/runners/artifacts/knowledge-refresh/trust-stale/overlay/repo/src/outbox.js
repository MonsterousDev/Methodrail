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
  sent.splice(hit.seq, 1);
  for (let i = hit.seq; i < sent.length; i += 1) {
    const shifted = Object.freeze({ ...sent[i], seq: i });
    sent[i] = shifted;
    if (shifted.eventId) byKey.set(shifted.eventId, shifted);
  }
  byKey.delete(eventId);
  return null;
}

function retryFailed() {
  return [];
}

function deliveries() {
  return sent.slice();
}

module.exports = { dispatchOnce, sendDirect, markFailed, retryFailed, deliveries };
