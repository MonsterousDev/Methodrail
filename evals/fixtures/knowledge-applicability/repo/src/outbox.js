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

function deliveries() {
  return sent.slice();
}

function countFor(channel) {
  let n = 0;
  for (const row of sent) {
    if (row.channel === channel) n += 1;
  }
  return n;
}

module.exports = { dispatchOnce, sendDirect, deliveries, countFor };
