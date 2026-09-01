export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  return { ok: true, id: order.id };
}

export function logWrite(_row) {
  return "pending";
}
