// BODY-LAB JSON backup v1 — keep this independent from game UI.
// Only JSON-compatible values are supported in this archive format.
import { openBodyLabDB, atomicWrite, STORES, DB_VERSION } from "./db.js";

export const BACKUP_FORMAT = "BODY-LAB-BACKUP";
export const BACKUP_VERSION = 1;
const STORE_NAMES = Object.values(STORES);
const MAX_BACKUP_BYTES = 20 * 1024 * 1024;

function fail(message) { throw new Error(message); }
const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const encode = x => new TextEncoder().encode(x);
function hex(bytes) { return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join(""); }
async function digest(payload) {
  if (!crypto?.subtle) fail("このブラウザでは整合性チェックを実行できません。");
  return hex(await crypto.subtle.digest("SHA-256", encode(JSON.stringify(payload))));
}

// One readonly transaction gives a consistent snapshot of every store.
export async function snapshotAll() {
  const db = await openBodyLabDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES, "readonly");
    const data = {};
    for (const name of STORE_NAMES) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => { data[name] = request.result; };
    }
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error || new Error("スナップショットを読めませんでした"));
    tx.onabort = () => reject(tx.error || new Error("スナップショット取得が中断されました"));
  });
}
export async function createBackup() {
  const payload = {
    format: BACKUP_FORMAT,
    backupVersion: BACKUP_VERSION,
    databaseVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    stores: await snapshotAll()
  };
  const checksum = await digest(payload);
  return { ...payload, checksum: "sha256:" + checksum };
}
export function backupText(archive) { return JSON.stringify(archive, null, 2); }
export function backupCounts(archive) {
  return Object.fromEntries(STORE_NAMES.map(name => [name, archive.stores[name].length]));
}

function validateStores(stores) {
  if (!isObject(stores)) fail("保存データ形式が不正です");
  for (const name of STORE_NAMES) {
    if (!Array.isArray(stores[name])) fail(name + " のデータがありません");
    const keyField = name === STORES.settings ? "key" : "id";
    const keys = new Set();
    const sources = new Set();
    for (const item of stores[name]) {
      if (!isObject(item) || typeof item[keyField] !== "string" || !item[keyField]) {
        fail(name + " に不正なIDがあります");
      }
      if (keys.has(item[keyField])) fail(name + " に重複IDがあります");
      keys.add(item[keyField]);
      if (name === STORES.spLedger && item.sourceKey !== undefined) {
        if (typeof item.sourceKey !== "string" || sources.has(item.sourceKey)) {
          fail("SP台帳の重複または不正なsourceKey");
        }
        sources.add(item.sourceKey);
      }
    }
  }
  const extras = Object.keys(stores).filter(x => !STORE_NAMES.includes(x));
  if (extras.length) fail("未知のデータ領域があります。新しいアプリで復元してください");
}

export async function parseAndValidateBackup(text) {
  if (encode(text).length > MAX_BACKUP_BYTES) fail("バックアップが20MBを超えています");
  let archive;
  try { archive = JSON.parse(text); } catch { fail("JSONとして読み込めません"); }
  if (!isObject(archive) || archive.format !== BACKUP_FORMAT) fail("BODY-LABのバックアップではありません");
  if (archive.backupVersion !== BACKUP_VERSION || archive.databaseVersion !== DB_VERSION) {
    fail("対応していないバックアップ形式です。変換せずに中断しました");
  }
  if (typeof archive.exportedAt !== "string" || Number.isNaN(Date.parse(archive.exportedAt))) {
    fail("バックアップ日時が不正です");
  }
  validateStores(archive.stores);
  if (!/^sha256:[0-9a-f]{64}$/.test(archive.checksum || "")) fail("整合性情報がありません");
  const { checksum, ...payload } = archive;
  const actual = "sha256:" + await digest(payload);
  if (checksum !== actual) fail("整合性検証失敗：ファイルが変更または破損しています");
  return archive;
}

// Destructive replace is atomic: errors abort the entire transaction.
// Call only after validating and offering a fresh safety backup to the user.
export async function restoreBackup(archive) {
  // Revalidate, even if caller forgot to do so.
  await parseAndValidateBackup(JSON.stringify(archive));
  await atomicWrite(STORE_NAMES, tx => {
    for (const name of STORE_NAMES) tx.objectStore(name).clear();
    for (const name of STORE_NAMES) {
      const store = tx.objectStore(name);
      for (const item of archive.stores[name]) store.add(item);
    }
  });
}
