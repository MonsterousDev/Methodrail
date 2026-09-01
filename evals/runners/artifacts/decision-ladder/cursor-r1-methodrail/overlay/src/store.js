import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");
const ordersPath = join(dataDir, "orders.json");
const writeLogPath = join(dataDir, "writes.jsonl");

function ensureDataDir() {
  mkdirSync(dataDir, { recursive: true });
}

function loadOrders() {
  try {
    const raw = readFileSync(ordersPath, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return {};
  } catch (err) {
    if (err && err.code === "ENOENT") return {};
    throw err;
  }
}

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  ensureDataDir();
  const orders = loadOrders();
  const record = { ...order };
  orders[String(order.id)] = record;
  writeFileSync(ordersPath, JSON.stringify(orders, null, 2) + "\n");
  logWrite({
    ts: new Date().toISOString(),
    action: "persist",
    id: order.id,
  });
  return { ok: true, id: order.id };
}

export function logWrite(row) {
  ensureDataDir();
  const line = JSON.stringify(row ?? {});
  appendFileSync(writeLogPath, line + "\n");
  return line;
}
