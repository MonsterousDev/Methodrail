export function createSubscription(customer, plan) {
  return {
    id: `sub_${customer.id}`,
    object: "subscription",
    provider: "stripe",
    customer: customer.id,
    items: [{ price: plan.priceId }],
    collection_method: "charge_automatically",
    status: "active",
  };
}
