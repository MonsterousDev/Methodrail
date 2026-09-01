import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data");
const ordersPath = join(dataDir, "orders.json");
const writeLogPath = join(dataDir, "writes.jsonl");

function ensureDataDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
}

function loadOrders() {
  ensureDataDir();
  if (!existsSync(ordersPath)) return [];
  const raw = readFileSync(ordersPath, "utf8").trim();
  if (!raw) return [];
  return JSON.parse(raw);
}

function saveOrders(orders) {
  ensureDataDir();
  writeFileSync(ordersPath, JSON.stringify(orders, null, 2) + "\n");
}

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  const orders = loadOrders();
  const idx = orders.findIndex((row) => row.id === order.id);
  if (idx >= 0) orders[idx] = order;
  else orders.push(order);
  saveOrders(orders);
  logWrite({
    event: "persist",
    id: order.id,
    at: new Date().toISOString(),
  });
  return { ok: true, id: order.id };
}

export function logWrite(row) {
  ensureDataDir();
  const line = JSON.stringify(row ?? {}) + "\n";
  appendFileSync(writeLogPath, line);
  return line.trim();
}
