export async function authorizeCharge(req) {
  const org = await loadOrg(req.orgId);
  const hold = await placeHold(org.billingAccountId, req.amount);
  enqueue("billing.authorize", { holdId: hold.id, orgId: org.id });
  return { status: "pending", holdId: hold.id };
}
