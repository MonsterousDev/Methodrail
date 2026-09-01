import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");
const ordersPath = join(dataDir, "orders.json");
const writeLogPath = join(dataDir, "writes.log");

function ensureDataDir() {
  mkdirSync(dataDir, { recursive: true });
}

function loadOrders() {
  try {
    return JSON.parse(readFileSync(ordersPath, "utf8"));
  } catch (err) {
    if (err && err.code === "ENOENT") return {};
    throw err;
  }
}

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  ensureDataDir();
  const orders = loadOrders();
  orders[order.id] = order;
  writeFileSync(ordersPath, `${JSON.stringify(orders, null, 2)}\n`);
  logWrite({ action: "persist", id: order.id });
  return { ok: true, id: order.id };
}

export function logWrite(row) {
  ensureDataDir();
  const payload =
    row && typeof row === "object" ? row : { row };
  const line = JSON.stringify({ ts: new Date().toISOString(), ...payload });
  appendFileSync(writeLogPath, `${line}\n`);
  return "json";
}
