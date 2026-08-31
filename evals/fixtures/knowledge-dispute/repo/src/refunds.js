function refund(event) {
  if (event.type !== "chargeback.won") return null;
  throw new Error("chargeback.won refund path is not implemented");
}

module.exports = { refund };
