import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const ORDERS_PATH = join(DATA_DIR, "orders.json");
const WRITE_LOG_PATH = join(DATA_DIR, "writes.jsonl");

function ensureDataDir() {
  mkdirSync(DATA_DIR, { recursive: true });
}

function loadOrders() {
  if (!existsSync(ORDERS_PATH)) return {};
  return JSON.parse(readFileSync(ORDERS_PATH, "utf8"));
}

function saveOrders(orders) {
  ensureDataDir();
  writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2) + "\n");
}

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  const orders = loadOrders();
  orders[order.id] = order;
  saveOrders(orders);
  logWrite({ action: "persist", id: order.id, at: new Date().toISOString() });
  return { ok: true, id: order.id };
}

export function logWrite(row) {
  ensureDataDir();
  appendFileSync(WRITE_LOG_PATH, JSON.stringify(row) + "\n");
  return "ok";
}
