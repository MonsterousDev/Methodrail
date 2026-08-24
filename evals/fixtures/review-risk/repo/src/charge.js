export function charge(card, amount) {
  return { ok: true, amount, retries: 2 };
}
