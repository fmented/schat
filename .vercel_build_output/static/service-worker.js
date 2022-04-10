var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _sw, _name, _db, _tx, tx_fn, _tableDefinition, _name2, _db2;
class SWBridge {
  constructor(sw2) {
    __privateAdd(this, _sw, void 0);
    __privateSet(this, _sw, sw2);
  }
  on(ev, cb) {
    __privateGet(this, _sw).addEventListener("message", (e) => {
      const data = e.data.data;
      const event = e.data.event;
      if (ev === event) {
        return cb(data);
      }
    });
    __privateGet(this, _sw).addEventListener("push", async (e) => {
      const d = await e.data.json();
      const data = d.data;
      const event = d.event;
      if (ev === event) {
        return cb(data);
      }
    });
  }
  async emit(event, data) {
    __privateGet(this, _sw).clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ event, data }));
    });
  }
}
_sw = new WeakMap();
async function sendRequest(url, data, fetchCtx = fetch) {
  const body = JSON.stringify(data);
  return fetchCtx(url, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  });
}
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== "undefined" && typeof msCrypto.getRandomValues === "function" && msCrypto.getRandomValues.bind(msCrypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}
var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
function validate(uuid) {
  return typeof uuid === "string" && REGEX.test(uuid);
}
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).substr(1));
}
function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  if (!validate(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (var i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return stringify(rnds);
}
var API_URL = /* @__PURE__ */ ((API_URL2) => {
  API_URL2["MESSAGE_SEEN"] = "/api/message/seen";
  API_URL2["MESSAGE_SEND"] = "/api/message/send";
  API_URL2["MESSAGE_RECEIVED"] = "/api/message/received";
  API_URL2["MESSAGE_SYNC"] = "/api/message/sync";
  API_URL2["AUTH_LOGIN"] = "/api/auth/login";
  API_URL2["AUTH_LOGOUT"] = "/api/auth/logout";
  API_URL2["AUTH_SIGNUP"] = "/api/auth/signup";
  API_URL2["AUTH_DETAIL"] = "/api/auth/detail";
  API_URL2["AUTH_FIND"] = "/api/auth/find";
  API_URL2["AUTH_SUBSCRIBE"] = "/api/auth/subscribe";
  API_URL2["UPDATE_BIO"] = "/api/update/bio";
  API_URL2["UPDATE_AVATAR"] = "/api/update/avatar";
  return API_URL2;
})(API_URL || {});
class CArray extends Array {
  sortBy(prop, reverse = false) {
    if (!this.length)
      return this;
    if (!(prop in this[0]))
      return this;
    const sortMod = reverse ? -1 : 1;
    const sort = (a, b) => {
      return a[prop] < b[prop] ? -1 * sortMod : a[prop] > b[prop] ? 1 * sortMod : 0;
    };
    this.sort(sort);
    return this;
  }
}
function every(obj1, obj2) {
  if (isComparator(obj1))
    return obj1(obj2);
  if (typeof obj1 === "object") {
    return Object.keys(obj1).every((key) => {
      const prop1 = obj1[key];
      const prop2 = obj1[key];
      return every(prop1, prop2);
    });
  }
  return obj1 === obj2;
}
function some(obj1, obj2) {
  if (isComparator(obj1))
    return obj1(obj2);
  if (typeof obj1 === "object") {
    return Object.keys(obj1).some((key) => {
      const prop1 = obj1[key];
      const prop2 = obj1[key];
      return some(prop1, prop2);
    });
  }
  return obj1 === obj2;
}
function isComparator(a) {
  return typeof a === "function";
}
class TableStore {
  constructor(name, db2) {
    __privateAdd(this, _tx);
    __privateAdd(this, _name, void 0);
    __privateAdd(this, _db, void 0);
    __privateSet(this, _name, name);
    __privateSet(this, _db, db2);
  }
  search(record, { index, direction } = {}) {
    const matches = new CArray();
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      if (Object.keys(record).length === 0)
        resolve(matches);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const value = c.value;
          const pk = c.primaryKey;
          const match = some(record, value);
          if (match)
            matches.push(__spreadProps(__spreadValues({}, value), {
              $pk: pk,
              update: (data) => {
                const toUpdate = __spreadValues(__spreadValues({}, value), data);
                return this.update(pk, toUpdate);
              },
              delete: () => this.delete(pk)
            }));
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(matches);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  searchOne(record, { index, direction } = {}) {
    let data;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      if (Object.keys(record).length === 0)
        resolve(null);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const value = c.value;
          const pk = c.primaryKey;
          const match = some(record, value);
          if (match) {
            data = __spreadProps(__spreadValues({}, value), {
              $pk: pk,
              update: (data2) => this.update(pk, __spreadValues(__spreadValues({}, value), data2)),
              delete: () => this.delete(pk)
            });
            return;
          }
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(data);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  find(record, { index, direction } = {}) {
    const matches = new CArray();
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      if (Object.keys(record).length === 0)
        resolve(matches);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const value = c.value;
          const pk = c.primaryKey;
          const match = every(record, value);
          if (match)
            matches.push(__spreadProps(__spreadValues({}, value), {
              $pk: pk,
              update: (data) => {
                const toUpdate = __spreadValues(__spreadValues({}, value), data);
                return this.update(pk, toUpdate);
              },
              delete: () => this.delete(pk)
            }));
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(matches);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  findOne(record, { index, direction } = {}) {
    let data;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      if (Object.keys(record).length === 0)
        resolve(null);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const value = c.value;
          const pk = c.primaryKey;
          const match = every(record, value);
          if (match) {
            data = __spreadProps(__spreadValues({}, value), {
              $pk: pk,
              update: (data2) => this.update(pk, __spreadValues(__spreadValues({}, value), data2)),
              delete: () => this.delete(pk)
            });
            return;
          }
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(data);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  includes(record) {
    let result = false;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = tx.objectStore(__privateGet(this, _name)).openCursor();
      cursor.onerror = (e) => reject(e);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (!c)
          return;
        else {
          const match = every(record, c.value);
          if (match)
            return result = true;
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = (e) => reject(e);
    });
  }
  has(record) {
    let result = false;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = tx.objectStore(__privateGet(this, _name)).openCursor();
      cursor.onerror = (e) => reject(e);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (!c)
          return;
        else {
          const match = some(record, c.value);
          if (match)
            return result = true;
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(result);
      tx.onerror = (e) => reject(e);
    });
  }
  async insertOne(data) {
    const tx = __privateMethod(this, _tx, tx_fn).call(this);
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(__privateGet(this, _name)).add(data);
      req.onerror = (e) => reject(e);
      req.onsuccess = (_) => tx.onerror = (e) => reject(e);
      tx.oncomplete = (_) => resolve();
    });
  }
  async insertMany(data) {
    const many = data.map(async (i2) => await this.insertOne(i2));
    return Promise.all(many);
  }
  async delete($pk) {
    const tx = __privateMethod(this, _tx, tx_fn).call(this);
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(__privateGet(this, _name)).delete($pk);
      req.onsuccess = () => req.onerror = (e) => reject(e);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
  deleteMany($pk) {
    const toDelete = [...$pk].map(async (i2) => this.delete(i2));
    return Promise.all(toDelete);
  }
  update($pk, data) {
    const tx = __privateMethod(this, _tx, tx_fn).call(this);
    return new Promise((resolve, reject) => {
      const req = tx.objectStore(__privateGet(this, _name)).put(data, $pk);
      req.onsuccess = () => req.onerror = (e) => reject(e);
      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
  updateMany(PK_Data_Pair) {
    const toUpdate = [...PK_Data_Pair.entries()].map(async ([pk, data]) => {
      await this.update(pk, data);
    });
    return Promise.all(toUpdate);
  }
  clear() {
    const tx = __privateMethod(this, _tx, tx_fn).call(this);
    return new Promise((resolve, reject) => {
      const clear = tx.objectStore(__privateGet(this, _name)).clear();
      clear.onerror = (e) => reject(e);
      clear.onsuccess = (_) => tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    });
  }
  count() {
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const c = tx.objectStore(__privateGet(this, _name)).count();
      c.onsuccess = () => c.onerror = (e) => reject(e);
      tx.oncomplete = () => resolve(c.result);
      tx.onerror = (e) => reject(e);
    });
  }
  get($pk) {
    let data;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = tx.objectStore(__privateGet(this, _name)).openCursor();
      const req = tx.objectStore(__privateGet(this, _name)).get($pk);
      cursor.onsuccess = () => {
        const value = req.result;
        data = __spreadProps(__spreadValues({}, value), {
          $pk,
          update: (data2) => {
            const toUpdate = Object.assign(value, data2);
            return this.update($pk, toUpdate);
          },
          delete: () => this.delete($pk)
        });
        return;
      };
      tx.oncomplete = () => resolve(data);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  async getMany($pk) {
    const toGet = [...$pk].map((pk) => this.get(pk));
    return new CArray(...await Promise.all(toGet));
  }
  all({ index, direction } = {}) {
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    const values = new CArray();
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          values.push(__spreadProps(__spreadValues({}, c.value), { $pk: c.primaryKey }));
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(values);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  retrieve(get, { index, direction } = {}) {
    const values = new CArray();
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const data = get(c.value);
          if (data !== void 0)
            values.push(data);
          c.continue();
        }
      };
      tx.oncomplete = () => resolve(values);
      tx.onerror = (e) => reject(e);
      cursor.onerror = (e) => reject(e);
    });
  }
  retrieveOne(get, { index, direction } = {}) {
    let data = null;
    const tx = __privateMethod(this, _tx, tx_fn).call(this, "readonly");
    return new Promise((resolve, reject) => {
      const cursor = index ? tx.objectStore(__privateGet(this, _name)).index(index).openCursor(null, direction) : tx.objectStore(__privateGet(this, _name)).openCursor(null, direction);
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c) {
          const d = get(c.value);
          if (d !== void 0)
            return data = d;
          c.continue();
        }
      };
      cursor.onerror = (e) => reject(e);
      tx.oncomplete = () => resolve(data);
      tx.onerror = (e) => reject(e);
    });
  }
}
_name = new WeakMap();
_db = new WeakMap();
_tx = new WeakSet();
tx_fn = function(mode = "readwrite") {
  return __privateGet(this, _db).transaction(__privateGet(this, _name), mode);
};
class Database {
  constructor(name, tableDefinition) {
    __privateAdd(this, _tableDefinition, void 0);
    __privateAdd(this, _name2, void 0);
    __privateAdd(this, _db2, void 0);
    __privateSet(this, _name2, name);
    __privateSet(this, _tableDefinition, tableDefinition);
    const self2 = this;
    const handler = {
      get(target, prop) {
        if (!__privateGet(self2, _db2))
          throw new Error("Database is not opened");
        return new TableStore(prop, __privateGet(self2, _db2));
      }
    };
    this.tables = new Proxy({}, handler);
  }
  get name() {
    return __privateGet(this, _name2);
  }
  async open() {
    if (__privateGet(this, _db2))
      return;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(__privateGet(this, _name2));
      request.onupgradeneeded = () => {
        const db2 = request.result;
        for (const table in __privateGet(this, _tableDefinition)) {
          const obj = db2.createObjectStore(table, { autoIncrement: true });
          for (const col of __privateGet(this, _tableDefinition)[table]) {
            obj.createIndex(col.name, col.name, col.unique ? { unique: true } : {});
          }
        }
        __privateSet(this, _db2, db2);
        resolve();
      };
      request.onsuccess = () => {
        __privateSet(this, _db2, request.result);
        resolve();
      };
      request.onerror = (e) => reject(e);
    });
  }
  async close() {
    if (!__privateGet(this, _db2))
      return;
    const d = __privateGet(this, _db2);
    __privateSet(this, _db2, void 0);
    return d.close();
  }
  async delete() {
    if (__privateGet(this, _db2)) {
      await this.close();
    }
    return new Promise((resolve, reject) => {
      const req = indexedDB.deleteDatabase(__privateGet(this, _name2));
      req.onsuccess = () => resolve();
      req.onerror = (e) => reject(e);
    });
  }
}
_tableDefinition = new WeakMap();
_name2 = new WeakMap();
_db2 = new WeakMap();
const sw = self;
let db;
let currentUser;
const s = new SWBridge(sw);
async function initDB() {
  db = new Database(currentUser, {
    chat: [
      { name: "from" },
      { name: "to" },
      { name: "content" },
      { name: "timeStamp" },
      { name: "id", unique: true },
      { name: "status" }
    ],
    profile: [
      { name: "username", unique: true },
      { name: "bio" },
      { name: "avatar" }
    ]
  });
}
s.on("after_login", async (data) => {
  currentUser = data.username;
  const deviceId = v4();
  try {
    await sendRequest(API_URL.AUTH_SUBSCRIBE, __spreadProps(__spreadValues({}, data), { deviceId }));
    s.emit("subscribed", deviceId);
  } catch (error) {
    return;
  }
});
s.on("open", async (s2) => {
  currentUser = s2;
  await initDB();
});
s.on("message_seen", async (msg) => {
  if (!db)
    return;
  await db.open();
  const m = await db.tables.chat.findOne({ id: msg.id });
  await m.update({ status: "seen" });
  await db.close();
  await s.emit("update", m.from === db.name ? m.to : m.from);
});
s.on("message_received", async (msg) => {
  if (!db)
    return;
  await db.open();
  const m = await db.tables.chat.findOne({ id: msg.id });
  await m.update({ status: "received" });
  await db.close();
  await s.emit("update", m.from === db.name ? m.to : m.from);
});
s.on("message_new", async (msg) => {
  if (!db)
    return;
  const profileExists = await db.tables.profile.findOne({ username: msg.from });
  if (!profileExists) {
    const res = await (await sendRequest(API_URL.AUTH_DETAIL, { username: msg.from })).json();
    await db.tables.profile.insertOne({ username: msg.from, bio: res.bio, avatar: res.avatar });
  }
  await db.tables.chat.insertOne(__spreadProps(__spreadValues({}, msg), { status: "received" }));
  await sendRequest(API_URL.MESSAGE_RECEIVED, { id: msg.to, receiver: msg.from });
  await db.close();
  await s.emit("update");
});
s.on("bio_update", async (u) => {
  if (!db)
    return;
  await db.open();
  const user = await db.tables.profile.findOne({ username: u.username });
  await user.update({ bio: u.bio });
  await db.close();
  await s.emit("profile_update", user);
});
s.on("avatar_update", async (u) => {
  if (!db)
    return;
  await db.open();
  const user = await db.tables.profile.findOne({ username: u.username });
  await user.update({ avatar: u.avatar });
  await db.close();
  await s.emit("profile_update", user);
});
s.on("sync", async (data) => {
  if (!db)
    return;
  await db.open();
  const ch = data.chat.map(async (c) => {
    if (await db.tables.chat.findOne({ id: c.id }))
      return;
    await db.tables.chat.insertOne(c);
  });
  const pr = data.profile.map(async (p) => {
    if (await db.tables.profile.findOne({ username: p.username }))
      return;
    await db.tables.profile.insertOne(p);
  });
  await Promise.all([...ch, ...pr]);
  await s.emit("update");
  await db.close();
});
sw.addEventListener("install", () => {
  sw.skipWaiting();
});
