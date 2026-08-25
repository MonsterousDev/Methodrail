const posted = [];
const byKey = new Map();

function post(walletId, cents, key) {
  const hit = byKey.get(key);
  if (hit) return hit;
  const row = Object.freeze({
    seq: posted.length,
    walletId,
    cents,
    key,
  });
  posted.push(row);
  byKey.set(key, row);
  return row;
}

function rows() {
  return posted.slice();
}

module.exports = { post, rows };
