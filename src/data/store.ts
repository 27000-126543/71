import type {
  User,
  Enterprise,
  SupplierBinding,
  TransactionOrder,
  LogisticsRecord,
  Invoice,
  CreditScore,
  FinanceApplication,
  ApprovalWorkflow,
  MonitoringMetrics,
  AlertEvent,
  RepaymentRecord,
  CollectionCase,
} from "@/src/types";
import {
  seedUsers,
  seedEnterprises,
  seedSupplierBindings,
  seedOrders,
  seedLogistics,
  seedInvoices,
  seedCreditScores,
  seedFinanceApplications,
  seedApprovalWorkflows,
  seedMonitoringMetrics,
  seedAlertEvents,
  seedRepayments,
  seedCollections,
} from "@/src/data/seed";

export interface DataStore {
  users: User[];
  enterprises: Enterprise[];
  supplierBindings: SupplierBinding[];
  orders: TransactionOrder[];
  logistics: LogisticsRecord[];
  invoices: Invoice[];
  creditScores: CreditScore[];
  financeApplications: FinanceApplication[];
  approvalWorkflows: ApprovalWorkflow[];
  monitoringMetrics: MonitoringMetrics[];
  alertEvents: AlertEvent[];
  repayments: RepaymentRecord[];
  collections: CollectionCase[];
  currentUserId?: string;
}

const STORAGE_KEY = "scf_mock_data_store_v1";

let memoryStore: DataStore | null = null;

export function delay<T>(data: T, min = 200, max = 600): Promise<T> {
  const ms = min + Math.floor(Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getSeedStore(): DataStore {
  return {
    users: deepClone(seedUsers),
    enterprises: deepClone(seedEnterprises),
    supplierBindings: deepClone(seedSupplierBindings),
    orders: deepClone(seedOrders),
    logistics: deepClone(seedLogistics),
    invoices: deepClone(seedInvoices),
    creditScores: deepClone(seedCreditScores),
    financeApplications: deepClone(seedFinanceApplications),
    approvalWorkflows: deepClone(seedApprovalWorkflows),
    monitoringMetrics: deepClone(seedMonitoringMetrics),
    alertEvents: deepClone(seedAlertEvents),
    repayments: deepClone(seedRepayments),
    collections: deepClone(seedCollections),
  };
}

function loadFromStorage(): DataStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DataStore;
  } catch {
    return null;
  }
}

function saveToStorage(store: DataStore): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
  }
}

export function initializeStore(force = false): DataStore {
  if (force) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    memoryStore = null;
  }

  if (memoryStore) {
    return deepClone(memoryStore);
  }

  const fromStorage = loadFromStorage();
  if (fromStorage) {
    memoryStore = fromStorage;
    return deepClone(memoryStore);
  }

  memoryStore = getSeedStore();
  saveToStorage(memoryStore);
  return deepClone(memoryStore);
}

export function resetStore(): DataStore {
  return initializeStore(true);
}

function commit(): void {
  if (!memoryStore) return;
  saveToStorage(memoryStore);
}

function readStore(): DataStore {
  if (!memoryStore) initializeStore();
  return memoryStore!;
}

function setCurrentUser(userId: string | undefined): void {
  const store = readStore();
  store.currentUserId = userId;
  commit();
}

function getCurrentUserId(): string | undefined {
  const store = readStore();
  return store.currentUserId;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function paginate<T>(items: T[], page?: number, pageSize?: number): PaginatedResult<T> {
  const p = page || 1;
  const ps = pageSize || 20;
  const total = items.length;
  const start = (p - 1) * ps;
  return {
    items: items.slice(start, start + ps),
    total,
    page: p,
    pageSize: ps,
  };
}

export const store = {
  initialize: initializeStore,
  reset: resetStore,
  delay,
  setCurrentUser,
  getCurrentUserId,
  paginate,

  users: {
    all: () => delay(readStore().users.map(deepClone)),
    get: (id: string) => delay(readStore().users.find((u) => u.id === id)).then(
      (u) => (u ? deepClone(u) : undefined)
    ),
    findByUsername: (username: string) =>
      delay(
        readStore()
          .users.filter((u) => u.username === username)
          .map(deepClone)[0]
      ),
    create: (u: User) => {
      const s = readStore();
      const cloned = deepClone(u);
      s.users.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<User>) => {
      const s = readStore();
      const idx = s.users.findIndex((u) => u.id === id);
      if (idx === -1) return delay(undefined as User | undefined);
      s.users[idx] = { ...s.users[idx], ...patch };
      commit();
      return delay(deepClone(s.users[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.users.findIndex((u) => u.id === id);
      if (idx === -1) return delay(false);
      s.users.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (u: User) => boolean) =>
      delay(readStore().users.filter(predicate).map(deepClone)),
  },

  enterprises: {
    all: () => delay(readStore().enterprises.map(deepClone)),
    get: (id: string) => {
      const e = readStore().enterprises.find((x) => x.id === id);
      return delay(e ? deepClone(e) : undefined);
    },
    create: (e: Enterprise) => {
      const s = readStore();
      const cloned = deepClone(e);
      s.enterprises.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<Enterprise>) => {
      const s = readStore();
      const idx = s.enterprises.findIndex((e) => e.id === id);
      if (idx === -1) return delay(undefined as Enterprise | undefined);
      s.enterprises[idx] = { ...s.enterprises[idx], ...patch };
      commit();
      return delay(deepClone(s.enterprises[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.enterprises.findIndex((e) => e.id === id);
      if (idx === -1) return delay(false);
      s.enterprises.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (e: Enterprise) => boolean) =>
      delay(readStore().enterprises.filter(predicate).map(deepClone)),
  },

  supplierBindings: {
    all: () => delay(readStore().supplierBindings.map(deepClone)),
    get: (id: string) => {
      const b = readStore().supplierBindings.find((x) => x.id === id);
      return delay(b ? deepClone(b) : undefined);
    },
    create: (b: SupplierBinding) => {
      const s = readStore();
      const cloned = deepClone(b);
      s.supplierBindings.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<SupplierBinding>) => {
      const s = readStore();
      const idx = s.supplierBindings.findIndex((b) => b.id === id);
      if (idx === -1) return delay(undefined as SupplierBinding | undefined);
      s.supplierBindings[idx] = { ...s.supplierBindings[idx], ...patch };
      commit();
      return delay(deepClone(s.supplierBindings[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.supplierBindings.findIndex((b) => b.id === id);
      if (idx === -1) return delay(false);
      s.supplierBindings.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (b: SupplierBinding) => boolean) =>
      delay(readStore().supplierBindings.filter(predicate).map(deepClone)),
  },

  orders: {
    all: () => delay(readStore().orders.map(deepClone)),
    get: (id: string) => {
      const o = readStore().orders.find((x) => x.id === id);
      return delay(o ? deepClone(o) : undefined);
    },
    create: (o: TransactionOrder) => {
      const s = readStore();
      const cloned = deepClone(o);
      s.orders.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<TransactionOrder>) => {
      const s = readStore();
      const idx = s.orders.findIndex((o) => o.id === id);
      if (idx === -1) return delay(undefined as TransactionOrder | undefined);
      s.orders[idx] = { ...s.orders[idx], ...patch };
      commit();
      return delay(deepClone(s.orders[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.orders.findIndex((o) => o.id === id);
      if (idx === -1) return delay(false);
      s.orders.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (o: TransactionOrder) => boolean) =>
      delay(readStore().orders.filter(predicate).map(deepClone)),
  },

  logistics: {
    all: () => delay(readStore().logistics.map(deepClone)),
    get: (id: string) => {
      const l = readStore().logistics.find((x) => x.id === id);
      return delay(l ? deepClone(l) : undefined);
    },
    getByOrderId: (orderId: string) => {
      const l = readStore().logistics.find((x) => x.orderId === orderId);
      return delay(l ? deepClone(l) : undefined);
    },
    create: (l: LogisticsRecord) => {
      const s = readStore();
      const cloned = deepClone(l);
      s.logistics.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<LogisticsRecord>) => {
      const s = readStore();
      const idx = s.logistics.findIndex((l) => l.id === id);
      if (idx === -1) return delay(undefined as LogisticsRecord | undefined);
      s.logistics[idx] = { ...s.logistics[idx], ...patch };
      commit();
      return delay(deepClone(s.logistics[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.logistics.findIndex((l) => l.id === id);
      if (idx === -1) return delay(false);
      s.logistics.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (l: LogisticsRecord) => boolean) =>
      delay(readStore().logistics.filter(predicate).map(deepClone)),
  },

  invoices: {
    all: () => delay(readStore().invoices.map(deepClone)),
    get: (id: string) => {
      const i = readStore().invoices.find((x) => x.id === id);
      return delay(i ? deepClone(i) : undefined);
    },
    create: (i: Invoice) => {
      const s = readStore();
      const cloned = deepClone(i);
      s.invoices.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<Invoice>) => {
      const s = readStore();
      const idx = s.invoices.findIndex((i) => i.id === id);
      if (idx === -1) return delay(undefined as Invoice | undefined);
      s.invoices[idx] = { ...s.invoices[idx], ...patch };
      commit();
      return delay(deepClone(s.invoices[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.invoices.findIndex((i) => i.id === id);
      if (idx === -1) return delay(false);
      s.invoices.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (i: Invoice) => boolean) =>
      delay(readStore().invoices.filter(predicate).map(deepClone)),
  },

  creditScores: {
    all: () => delay(readStore().creditScores.map(deepClone)),
    get: (id: string) => {
      const c = readStore().creditScores.find((x) => x.id === id);
      return delay(c ? deepClone(c) : undefined);
    },
    getBySupplier: (supplierId: string) => {
      const c = readStore().creditScores.find((x) => x.supplierId === supplierId);
      return delay(c ? deepClone(c) : undefined);
    },
    create: (c: CreditScore) => {
      const s = readStore();
      const cloned = deepClone(c);
      s.creditScores.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<CreditScore>) => {
      const s = readStore();
      const idx = s.creditScores.findIndex((c) => c.id === id);
      if (idx === -1) return delay(undefined as CreditScore | undefined);
      s.creditScores[idx] = { ...s.creditScores[idx], ...patch };
      commit();
      return delay(deepClone(s.creditScores[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.creditScores.findIndex((c) => c.id === id);
      if (idx === -1) return delay(false);
      s.creditScores.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (c: CreditScore) => boolean) =>
      delay(readStore().creditScores.filter(predicate).map(deepClone)),
  },

  financeApplications: {
    all: () => delay(readStore().financeApplications.map(deepClone)),
    get: (id: string) => {
      const f = readStore().financeApplications.find((x) => x.id === id);
      return delay(f ? deepClone(f) : undefined);
    },
    create: (f: FinanceApplication) => {
      const s = readStore();
      const cloned = deepClone(f);
      s.financeApplications.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<FinanceApplication>) => {
      const s = readStore();
      const idx = s.financeApplications.findIndex((f) => f.id === id);
      if (idx === -1) return delay(undefined as FinanceApplication | undefined);
      s.financeApplications[idx] = { ...s.financeApplications[idx], ...patch };
      commit();
      return delay(deepClone(s.financeApplications[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.financeApplications.findIndex((f) => f.id === id);
      if (idx === -1) return delay(false);
      s.financeApplications.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (f: FinanceApplication) => boolean) =>
      delay(readStore().financeApplications.filter(predicate).map(deepClone)),
  },

  approvalWorkflows: {
    all: () => delay(readStore().approvalWorkflows.map(deepClone)),
    get: (id: string) => {
      const w = readStore().approvalWorkflows.find((x) => x.id === id);
      return delay(w ? deepClone(w) : undefined);
    },
    getByFinanceId: (financeId: string) => {
      const w = readStore().approvalWorkflows.find((x) => x.financeApplicationId === financeId);
      return delay(w ? deepClone(w) : undefined);
    },
    create: (w: ApprovalWorkflow) => {
      const s = readStore();
      const cloned = deepClone(w);
      s.approvalWorkflows.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<ApprovalWorkflow>) => {
      const s = readStore();
      const idx = s.approvalWorkflows.findIndex((w) => w.id === id);
      if (idx === -1) return delay(undefined as ApprovalWorkflow | undefined);
      s.approvalWorkflows[idx] = { ...s.approvalWorkflows[idx], ...patch };
      commit();
      return delay(deepClone(s.approvalWorkflows[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.approvalWorkflows.findIndex((w) => w.id === id);
      if (idx === -1) return delay(false);
      s.approvalWorkflows.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (w: ApprovalWorkflow) => boolean) =>
      delay(readStore().approvalWorkflows.filter(predicate).map(deepClone)),
  },

  monitoringMetrics: {
    all: () => delay(readStore().monitoringMetrics.map(deepClone)),
    get: (id: string) => {
      const m = readStore().monitoringMetrics.find((x) => x.id === id);
      return delay(m ? deepClone(m) : undefined);
    },
    create: (m: MonitoringMetrics) => {
      const s = readStore();
      const cloned = deepClone(m);
      s.monitoringMetrics.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<MonitoringMetrics>) => {
      const s = readStore();
      const idx = s.monitoringMetrics.findIndex((m) => m.id === id);
      if (idx === -1) return delay(undefined as MonitoringMetrics | undefined);
      s.monitoringMetrics[idx] = { ...s.monitoringMetrics[idx], ...patch };
      commit();
      return delay(deepClone(s.monitoringMetrics[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.monitoringMetrics.findIndex((m) => m.id === id);
      if (idx === -1) return delay(false);
      s.monitoringMetrics.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (m: MonitoringMetrics) => boolean) =>
      delay(readStore().monitoringMetrics.filter(predicate).map(deepClone)),
    getBySupplierRange: (supplierId: string, fromDate: string, toDate: string) =>
      delay(
        readStore()
          .monitoringMetrics.filter(
            (m) => m.supplierId === supplierId && m.date >= fromDate && m.date <= toDate
          )
          .map(deepClone)
      ),
  },

  alertEvents: {
    all: () => delay(readStore().alertEvents.map(deepClone)),
    get: (id: string) => {
      const a = readStore().alertEvents.find((x) => x.id === id);
      return delay(a ? deepClone(a) : undefined);
    },
    create: (a: AlertEvent) => {
      const s = readStore();
      const cloned = deepClone(a);
      s.alertEvents.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<AlertEvent>) => {
      const s = readStore();
      const idx = s.alertEvents.findIndex((a) => a.id === id);
      if (idx === -1) return delay(undefined as AlertEvent | undefined);
      s.alertEvents[idx] = { ...s.alertEvents[idx], ...patch };
      commit();
      return delay(deepClone(s.alertEvents[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.alertEvents.findIndex((a) => a.id === id);
      if (idx === -1) return delay(false);
      s.alertEvents.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (a: AlertEvent) => boolean) =>
      delay(readStore().alertEvents.filter(predicate).map(deepClone)),
  },

  repayments: {
    all: () => delay(readStore().repayments.map(deepClone)),
    get: (id: string) => {
      const r = readStore().repayments.find((x) => x.id === id);
      return delay(r ? deepClone(r) : undefined);
    },
    getByApplication: (appId: string) =>
      delay(readStore().repayments.filter((r) => r.financeApplicationId === appId).map(deepClone)),
    create: (r: RepaymentRecord) => {
      const s = readStore();
      const cloned = deepClone(r);
      s.repayments.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<RepaymentRecord>) => {
      const s = readStore();
      const idx = s.repayments.findIndex((r) => r.id === id);
      if (idx === -1) return delay(undefined as RepaymentRecord | undefined);
      s.repayments[idx] = { ...s.repayments[idx], ...patch };
      commit();
      return delay(deepClone(s.repayments[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.repayments.findIndex((r) => r.id === id);
      if (idx === -1) return delay(false);
      s.repayments.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (r: RepaymentRecord) => boolean) =>
      delay(readStore().repayments.filter(predicate).map(deepClone)),
  },

  collections: {
    all: () => delay(readStore().collections.map(deepClone)),
    get: (id: string) => {
      const c = readStore().collections.find((x) => x.id === id);
      return delay(c ? deepClone(c) : undefined);
    },
    getByApplication: (appId: string) =>
      delay(readStore().collections.filter((x) => x.financeApplicationId === appId).map(deepClone)),
    create: (c: CollectionCase) => {
      const s = readStore();
      const cloned = deepClone(c);
      s.collections.push(cloned);
      commit();
      return delay(deepClone(cloned));
    },
    update: (id: string, patch: Partial<CollectionCase>) => {
      const s = readStore();
      const idx = s.collections.findIndex((c) => c.id === id);
      if (idx === -1) return delay(undefined as CollectionCase | undefined);
      s.collections[idx] = { ...s.collections[idx], ...patch };
      commit();
      return delay(deepClone(s.collections[idx]));
    },
    remove: (id: string) => {
      const s = readStore();
      const idx = s.collections.findIndex((c) => c.id === id);
      if (idx === -1) return delay(false);
      s.collections.splice(idx, 1);
      commit();
      return delay(true);
    },
    filter: (predicate: (c: CollectionCase) => boolean) =>
      delay(readStore().collections.filter(predicate).map(deepClone)),
  },
};

export default store;
