const rows = [];

function record(entry) {
  const id = String(rows.length + 1);
  const tax = entry.taxCode === "exempt" ? 0 : Math.round(entry.priceCents * 0.1);
  const row = { id, net: entry.priceCents, tax, sku: entry.sku };
  rows.push(row);
  return { id, total: row.net + row.tax };
}

function balance() {
  return rows.reduce((sum, row) => sum + row.net + row.tax, 0);
}

function reverse(id) {
  const row = rows.find((item) => item.id === id);
  if (!row) return null;
  row.reversed = true;
  return row;
}

module.exports = { record, balance, reverse };
