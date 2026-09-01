const ledger = require("./billing/ledger.js");

function intake(order, pricingInternals) {
  const quoted = {
    priceCents: pricingInternals.priceCents,
    taxCode: pricingInternals.taxCode,
    sku: order.sku,
  };
  return ledger.record(quoted);
}

function fromCart(order, pricingInternals) {
  return intake(order, pricingInternals);
}

function fromApi(order, pricingInternals) {
  return intake(order, pricingInternals);
}

function fromCli(order, pricingInternals) {
  return intake(order, pricingInternals);
}

module.exports = { intake, fromCart, fromApi, fromCli };
