function getStripeChargeId(event) {
  return event.stripeChargeId || event.stripe_charge_id || event.chargeId || event.charge_id;
}

function getAdyenPspReference(event) {
  return (
    event.adyenPspReference ||
    event.pspReference ||
    event.psp_reference ||
    event.originalPspReference
  );
}

function refundStripe(event, client) {
  if (!client || !client.refunds || typeof client.refunds.create !== "function") {
    throw new Error("chargeback.won refund path requires stripe.refunds.create");
  }

  const response = client.refunds.create({
    charge: getStripeChargeId(event),
    amount: event.amount,
    currency: event.currency,
    metadata: {
      chargeback_event_id: event.id,
      reason: "chargeback.won",
    },
  });

  return {
    provider: "stripe",
    refundId: response.id,
    raw: response,
  };
}

function refundAdyen(event, client) {
  if (!client || typeof client.refund !== "function") {
    throw new Error("chargeback.won refund path requires adyen.refund");
  }

  const response = client.refund({
    pspReference: getAdyenPspReference(event),
    amount: {
      value: event.amount,
      currency: event.currency,
    },
    reference: event.id,
    reason: "chargeback.won",
  });

  return {
    provider: "adyen",
    refundId: response.pspReference,
    raw: response,
  };
}

function refund(event, clients = {}) {
  if (event.type !== "chargeback.won") return null;

  const hasStripeCharge = Boolean(getStripeChargeId(event));
  const hasAdyenReference = Boolean(getAdyenPspReference(event));

  if (hasStripeCharge && hasAdyenReference) {
    throw new Error("chargeback.won refund path is ambiguous");
  }

  if (hasStripeCharge) return refundStripe(event, clients.stripe);
  if (hasAdyenReference) return refundAdyen(event, clients.adyen);

  throw new Error("chargeback.won refund path requires a processor reference");
}

module.exports = { refund };
