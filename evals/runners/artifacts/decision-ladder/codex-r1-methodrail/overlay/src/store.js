import fs from "node:fs";
import path from "node:path";

const STORE_DIR = process.env.SHOP_STORE_DIR || path.resolve(process.cwd(), "data");
const ORDERS_PATH = process.env.SHOP_ORDERS_FILE || path.join(STORE_DIR, "orders.json");
const WRITE_LOG_PATH =
  process.env.SHOP_WRITE_LOG_FILE || path.join(STORE_DIR, "order-writes.jsonl");

export function persist(order) {
  if (!order || !order.id) throw new Error("order.id required");
  const savedOrder = structuredClone(order);
  const orders = readOrders();
  const existingIndex = orders.findIndex((row) => row.id === savedOrder.id);

  if (existingIndex === -1) {
    orders.push(savedOrder);
  } else {
    orders[existingIndex] = savedOrder;
  }

  writeJsonFile(ORDERS_PATH, orders);
  logWrite({ action: existingIndex === -1 ? "insert" : "replace", order: savedOrder });

  return { ok: true, id: order.id };
}

export function logWrite(row) {
  ensureParentDir(WRITE_LOG_PATH);
  const entry = {
    ts: new Date().toISOString(),
    ...row,
  };

  fs.appendFileSync(WRITE_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  return { ok: true, path: WRITE_LOG_PATH };
}

export function listOrders() {
  return readOrders();
}

function readOrders() {
  if (!fs.existsSync(ORDERS_PATH)) return [];

  const content = fs.readFileSync(ORDERS_PATH, "utf8").trim();
  if (!content) return [];

  const orders = JSON.parse(content);
  if (!Array.isArray(orders)) throw new Error("orders store must contain a JSON array");

  return orders;
}

function writeJsonFile(filePath, value) {
  ensureParentDir(filePath);
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;

  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
