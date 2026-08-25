const { post, rows } = require("./ledger");

function handle(event) {
  if (event.type === "charge.succeeded") {
    return post(event.data.walletId, event.data.cents, event.id);
  }
  return null;
}

function balanceOf(walletId) {
  let n = 0;
  for (const row of rows()) {
    if (row.walletId === walletId) n += row.cents;
  }
  return n;
}

module.exports = { handle, balanceOf };
