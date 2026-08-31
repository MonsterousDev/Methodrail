function refund(event) {
  if (event.type !== "chargeback.won") return null;
  return postStripeRefund(event.id);
}

function postStripeRefund(chargeId) {
  return {
    processor: "stripe",
    chargeId,
    refundId: `re_${chargeId}`,
    status: "posted",
  };
}

module.exports = { refund };
