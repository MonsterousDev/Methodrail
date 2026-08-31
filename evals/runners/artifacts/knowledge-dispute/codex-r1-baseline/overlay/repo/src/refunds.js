function refund(event) {
  if (event.type !== "chargeback.won") return null;
  return {
    type: "refund.posted",
    chargebackId: event.id,
  };
}

module.exports = { refund };
