function refund(event) {
  if (event.type !== "chargeback.won") return null;
  return { processor: "stripe", chargeId: event.id, status: "refunded" };
}

module.exports = { refund };
