// BODY-LAB — IndexedDB foundation v0.1
// Data stays in this browser until explicitly exported. GitHub does not store user records.
export const DB_NAME = "body-lab";
export const DB_VERSION = 1;
export const STORES = Object.freeze({
  records: "records",
  spLedger: "spLedger",
  unlocks: "unlocks",
  profiles: "profiles",
  exercises: "exercises",
  settings: "settings"
});
let openPromise = null;

export function openBodyLabDB() {
  if (openPromise) return openPromise;
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable"));
  openPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const make = (name, keyPath = "id") => {
        if (db.objectStoreNames.contains(name)) return null;
        return db.createObjectStore(name, { keyPath });
      };
      const records = make(STORES.records);
      if (records) {
        records.createIndex("profileId", "profileId");
        records.createIndex("exerciseId", "exerciseId");
        records.createIndex("performedAt", "performedAt");
      }
      const ledger = make(STORES.spLedger);
      if (ledger) {
        ledger.createIndex("profileId", "profileId");
        ledger.createIndex("sourceKey", "sourceKey", { unique: true });
      }
      make(STORES.unlocks);
      make(STORES.profiles);
      make(STORES.exercises);
      make(STORES.settings, "key");
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); openPromise = null; };
      resolve(db);
    };
    request.onerror = () => reject(request.error || new Error("Database open failed"));
    request.onblocked = () => reject(new Error("Close other BODY-LAB tabs and retry"));
  }).catch(error => { openPromise = null; throw error; });
  return openPromise;
}

// Enqueue IndexedDB operations synchronously inside callback.
// A transaction commits all operations together or none.
export async function atomicWrite(storeNames, callback) {
  const db = await openBodyLabDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, "readwrite");
    try {
      const result = callback(tx);
      if (result && typeof result.then === "function") {
        throw new Error("Do not use async callbacks inside atomicWrite");
      }
    } catch (error) {
      tx.abort();
      reject(error);
      return;
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Write failed"));
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
  });
}

export async function getAll(storeName) {
  const db = await openBodyLabDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOne(storeName, key) {
  const db = await openBodyLabDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction(storeName, "readonly").objectStore(storeName).get(key);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}
