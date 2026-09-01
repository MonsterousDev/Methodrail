export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  return { ok: true, id: order.id, store: "json-file" };
}

export function logWrite(row) {
  return JSON.stringify(row);
}
