import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_STORE_PATH = "data/orders.json";
const DEFAULT_WRITE_LOG_PATH = "data/order-writes.jsonl";

function storePath() {
  return resolve(process.env.ORDER_STORE_PATH || DEFAULT_STORE_PATH);
}

function writeLogPath() {
  return resolve(process.env.ORDER_WRITE_LOG_PATH || DEFAULT_WRITE_LOG_PATH);
}

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function readOrders(path) {
  try {
    const raw = readFileSync(path, "utf8");
    if (!raw.trim()) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.orders)) {
      throw new Error("order store must contain an orders array");
    }

    return parsed.orders;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function writeOrders(path, orders) {
  ensureParent(path);
  const tempPath = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify({ orders }, null, 2)}\n`);
  renameSync(tempPath, path);
}

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");

  const path = storePath();
  const orders = readOrders(path);
  const existingIndex = orders.findIndex((row) => row.id === order.id);
  const savedOrder = {
    ...order,
    persistedAt: new Date().toISOString(),
  };

  if (existingIndex === -1) {
    orders.push(savedOrder);
  } else {
    orders[existingIndex] = savedOrder;
  }

  writeOrders(path, orders);
  logWrite({
    action: existingIndex === -1 ? "insert" : "update",
    id: order.id,
    store: path,
  });

  return { ok: true, id: order.id };
}

export function logWrite(row) {
  const path = writeLogPath();
  const entry = row && typeof row === "object" ? row : { value: row };

  ensureParent(path);
  appendFileSync(path, `${JSON.stringify({ ...entry, ts: new Date().toISOString() })}\n`);
  return { ok: true, path };
}
