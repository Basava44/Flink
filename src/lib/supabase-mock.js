// Mock Supabase client for local development without a Supabase backend.
// Activated by setting VITE_USE_MOCK=true (see `npm run dev:mock`).

import {
  mockAuthUser,
  mockSession,
  mockUsers,
  mockFlinkProfiles,
  mockSocialLinks,
  mockConnections,
} from "./fixtures";

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// In-memory tables (mutable copies of fixtures)
let tables = {
  users: clone(mockUsers),
  flink_profiles: clone(mockFlinkProfiles),
  social_links: clone(mockSocialLinks),
  connections: clone(mockConnections),
};

let nextId = 100;
const genId = () => `mock-${++nextId}`;

// Auth state
let currentSession = clone(mockSession);
const authListeners = new Set();

function notifyAuthListeners(event, session) {
  authListeners.forEach((cb) => cb(event, session));
}

// ---- Query builder that mimics Supabase's chaining API ----

function createQueryBuilder(tableName) {
  let rows = clone(tables[tableName] || []);
  let filters = [];
  let orFilter = null;
  let orderCol = null;
  let orderAsc = true;
  let limitCount = null;
  let isSingle = false;
  let selectFields = "*";
  let operation = "select"; // select | insert | update | delete
  let payload = null;

  const applyFilters = () => {
    let result = rows;

    if (orFilter) {
      // Simple or() support: "col1.eq.val1,col2.eq.val2"
      const parts = orFilter.split(",");
      result = result.filter((row) =>
        parts.some((part) => {
          const match = part.match(/^(\w+)\.eq\.(.+)$/);
          if (match) return String(row[match[1]]) === match[2];
          return false;
        })
      );
    }

    for (const { col, op, val } of filters) {
      result = result.filter((row) => {
        switch (op) {
          case "eq":
            return String(row[col]) === String(val);
          case "neq":
            return String(row[col]) !== String(val);
          case "ilike":
            return String(row[col] || "")
              .toLowerCase()
              .includes(val.replace(/%/g, "").toLowerCase());
          default:
            return true;
        }
      });
    }

    if (orderCol) {
      result.sort((a, b) => {
        if (a[orderCol] < b[orderCol]) return orderAsc ? -1 : 1;
        if (a[orderCol] > b[orderCol]) return orderAsc ? 1 : -1;
        return 0;
      });
    }

    if (limitCount != null) {
      result = result.slice(0, limitCount);
    }

    // Resolve foreign-key-style joins in select fields
    result = resolveJoins(tableName, result, selectFields);

    return result;
  };

  // Resolve join syntax like "*, sender:users!connections_sender_id_fkey(id, name, ...)"
  function resolveJoins(table, rows, fields) {
    if (!fields || fields === "*") return rows;

    // Match patterns like: alias:table!fkey(cols)
    const joinPattern = /(\w+):(\w+)![\w]+\(([^)]+)\)/g;
    let match;
    const joins = [];
    while ((match = joinPattern.exec(fields)) !== null) {
      joins.push({
        alias: match[1],
        joinTable: match[2],
        cols: match[3].split(",").map((c) => c.trim()),
      });
    }

    if (joins.length === 0) return rows;

    return rows.map((row) => {
      const newRow = { ...row };
      for (const join of joins) {
        // Figure out which column links to the join table
        const fkCol = join.alias + "_id"; // e.g. sender_id
        const joinedRow = (tables[join.joinTable] || []).find(
          (r) => r.id === row[fkCol]
        );
        if (joinedRow) {
          const picked = {};
          for (const col of join.cols) {
            // Handle nested joins like flink_profiles(handle, bio, location)
            if (col.includes("(")) {
              const nestedMatch = col.match(/(\w+)\(([^)]+)\)/);
              if (nestedMatch) {
                const nestedTable = nestedMatch[1];
                const nestedCols = nestedMatch[2].split(",").map((c) => c.trim());
                const nestedRows = (tables[nestedTable] || []).filter(
                  (r) => r.user_id === joinedRow.id
                );
                picked[nestedTable] = nestedRows.map((nr) => {
                  const p = {};
                  nestedCols.forEach((nc) => (p[nc] = nr[nc]));
                  return p;
                });
              }
            } else {
              picked[col] = joinedRow[col];
            }
          }
          newRow[join.alias] = picked;
        } else {
          newRow[join.alias] = null;
        }
      }
      return newRow;
    });
  }

  const builder = {
    select(fields) {
      selectFields = fields || "*";
      operation = "select";
      return builder;
    },
    insert(data) {
      operation = "insert";
      payload = Array.isArray(data) ? data : [data];
      return builder;
    },
    update(data) {
      operation = "update";
      payload = data;
      return builder;
    },
    delete() {
      operation = "delete";
      return builder;
    },
    eq(col, val) {
      filters.push({ col, op: "eq", val });
      return builder;
    },
    neq(col, val) {
      filters.push({ col, op: "neq", val });
      return builder;
    },
    ilike(col, val) {
      filters.push({ col, op: "ilike", val });
      return builder;
    },
    or(expr) {
      orFilter = expr;
      return builder;
    },
    order(col, opts = {}) {
      orderCol = col;
      orderAsc = opts.ascending !== false;
      return builder;
    },
    limit(n) {
      limitCount = n;
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    // Terminal — returns a promise-like thenable
    then(resolve, reject) {
      try {
        let result;

        switch (operation) {
          case "select": {
            result = applyFilters();
            break;
          }
          case "insert": {
            const inserted = payload.map((item) => ({
              id: item.id || genId(),
              ...item,
            }));
            tables[tableName] = [...(tables[tableName] || []), ...inserted];
            rows = inserted;
            filters = []; // clear filters for select after insert
            result = selectFields ? inserted : inserted;
            break;
          }
          case "update": {
            const filtered = applyFilters();
            filtered.forEach((match) => {
              const idx = tables[tableName].findIndex((r) => r.id === match.id);
              if (idx !== -1) {
                tables[tableName][idx] = { ...tables[tableName][idx], ...payload };
              }
            });
            // Re-read updated rows
            result = filtered.map((match) => {
              const updated = tables[tableName].find((r) => r.id === match.id);
              return updated || match;
            });
            break;
          }
          case "delete": {
            const toDelete = applyFilters();
            const deleteIds = new Set(toDelete.map((r) => r.id));
            tables[tableName] = tables[tableName].filter(
              (r) => !deleteIds.has(r.id)
            );
            result = toDelete;
            break;
          }
        }

        if (isSingle) {
          if (result.length === 0) {
            resolve({
              data: null,
              error: { message: "Row not found", code: "PGRST116" },
            });
            return;
          }
          resolve({ data: result[0], error: null });
          return;
        }

        resolve({ data: result, error: null });
      } catch (err) {
        if (reject) reject(err);
        else resolve({ data: null, error: { message: err.message } });
      }
    },
  };

  return builder;
}

// ---- Storage mock ----

const storageBuckets = {};

function createStorageBucket(bucketName) {
  if (!storageBuckets[bucketName]) {
    storageBuckets[bucketName] = {};
  }
  return {
    upload(path, _file, _opts) {
      storageBuckets[bucketName][path] = true;
      return Promise.resolve({ data: { path }, error: null });
    },
    getPublicUrl(path) {
      return {
        data: { publicUrl: `/mock-storage/${bucketName}/${path}` },
      };
    },
  };
}

// ---- Mock Supabase client ----

export const supabase = {
  from(table) {
    return createQueryBuilder(table);
  },

  storage: {
    from(bucket) {
      return createStorageBucket(bucket);
    },
  },

  auth: {
    async getSession() {
      return { data: { session: currentSession }, error: null };
    },

    async getUser() {
      return currentSession
        ? { data: { user: currentSession.user }, error: null }
        : { data: { user: null }, error: { message: "Not authenticated" } };
    },

    async signUp({ email, password, options }) {
      const newUser = {
        ...clone(mockAuthUser),
        id: genId(),
        email,
        user_metadata: { ...mockAuthUser.user_metadata, ...options?.data },
      };
      const session = { ...clone(mockSession), user: newUser };
      currentSession = session;
      notifyAuthListeners("SIGNED_UP", session);
      return { data: { user: newUser, session }, error: null };
    },

    async signInWithPassword({ email, password }) {
      // Accept any credentials in mock mode
      const matchedUser = tables.users.find((u) => u.email === email);
      const authUser = matchedUser
        ? { ...clone(mockAuthUser), id: matchedUser.id, email: matchedUser.email }
        : clone(mockAuthUser);
      const session = { ...clone(mockSession), user: authUser };
      currentSession = session;
      notifyAuthListeners("SIGNED_IN", session);
      return { data: { user: authUser, session }, error: null };
    },

    async signInWithOAuth({ provider, options }) {
      // Simulate OAuth by signing in as the demo user
      currentSession = clone(mockSession);
      notifyAuthListeners("SIGNED_IN", currentSession);
      return { data: { url: null }, error: null };
    },

    async signOut() {
      currentSession = null;
      notifyAuthListeners("SIGNED_OUT", null);
      return { error: null };
    },

    async resetPasswordForEmail(email, options) {
      console.log("[Mock] Password reset email would be sent to:", email);
      return { data: {}, error: null };
    },

    async updateUser({ password }) {
      console.log("[Mock] Password updated");
      return { data: { user: currentSession?.user }, error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);
      // Immediately fire with current session
      setTimeout(() => {
        if (currentSession) {
          callback("SIGNED_IN", currentSession);
        }
      }, 0);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
};
