function refund(event) {
  if (event.type !== "chargeback.won") return null;
  return {
    posted: true,
    chargeId: event.id,
  };
}

module.exports = { refund };
