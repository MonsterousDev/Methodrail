const assert = require("node:assert/strict");
const test = require("node:test");
const { refund } = require("./refunds");

test("ignores events that are not chargeback.won", () => {
  assert.equal(refund({ type: "chargeback.lost", id: "cb_lost" }), null);
});

test("refunds chargeback.won events through Stripe when a charge id is present", () => {
  const calls = [];
  const clients = {
    stripe: {
      refunds: {
        create(params) {
          calls.push(params);
          return { id: "re_123", status: "succeeded" };
        },
      },
    },
  };

  const result = refund(
    {
      type: "chargeback.won",
      id: "cb_123",
      stripeChargeId: "ch_123",
      amount: 2500,
      currency: "usd",
    },
    clients,
  );

  assert.deepEqual(calls, [
    {
      charge: "ch_123",
      amount: 2500,
      currency: "usd",
      metadata: {
        chargeback_event_id: "cb_123",
        reason: "chargeback.won",
      },
    },
  ]);
  assert.equal(result.provider, "stripe");
  assert.equal(result.refundId, "re_123");
});

test("refunds chargeback.won events through Adyen when a PSP reference is present", () => {
  const calls = [];
  const clients = {
    adyen: {
      refund(params) {
        calls.push(params);
        return { pspReference: "refund_psp_123", resultCode: "Received" };
      },
    },
  };

  const result = refund(
    {
      type: "chargeback.won",
      id: "cb_456",
      pspReference: "psp_456",
      amount: 3900,
      currency: "EUR",
    },
    clients,
  );

  assert.deepEqual(calls, [
    {
      pspReference: "psp_456",
      amount: {
        value: 3900,
        currency: "EUR",
      },
      reference: "cb_456",
      reason: "chargeback.won",
    },
  ]);
  assert.equal(result.provider, "adyen");
  assert.equal(result.refundId, "refund_psp_123");
});

test("rejects chargeback.won events without a processor reference", () => {
  assert.throws(
    () => refund({ type: "chargeback.won", id: "cb_pending" }),
    /requires a processor reference/,
  );
});

test("rejects chargeback.won events with conflicting processor references", () => {
  assert.throws(
    () =>
      refund({
        type: "chargeback.won",
        id: "cb_ambiguous",
        stripeChargeId: "ch_ambiguous",
        pspReference: "psp_ambiguous",
      }),
    /ambiguous/,
  );
});
