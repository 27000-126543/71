import type { AlertEvent, MonitoringMetrics, PaginatedResult } from "@/src/types";
import { store } from "@/src/data/store";
import { MonitoringEngine } from "@/src/engine/MonitoringEngine";

export async function getMetricsBySupplier(supplierId: string): Promise<MonitoringMetrics[]> {
  const all = await store.monitoringMetrics.filter((m) => m.supplierId === supplierId);
  return all.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export async function getMetrics(supplierId?: string): Promise<MonitoringMetrics[]> {
  if (!supplierId) {
    const all = await store.monitoringMetrics.all();
    return all.sort((a, b) => (a.date < b.date ? -1 : 1));
  }
  return getMetricsBySupplier(supplierId);
}

export async function getRecentMetrics(
  supplierId: string,
  days: number = 30
): Promise<MonitoringMetrics[]> {
  const all = await getMetricsBySupplier(supplierId);
  return all.slice(-days);
}

export async function getAllAlerts(): Promise<AlertEvent[]> {
  return store.alertEvents.all();
}

export async function listAlerts(params?: {
  supplierId?: string;
  status?: string;
  level?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<AlertEvent>> {
  let all = await store.alertEvents.all();
  if (params?.supplierId) {
    all = all.filter((a) => a.supplierId === params.supplierId);
  }
  if (params?.status) {
    all = all.filter((a) => a.status === params.status);
  }
  if (params?.level) {
    all = all.filter((a) => a.level === params.level);
  }
  all.sort((a, b) => (a.triggeredAt < b.triggeredAt ? 1 : -1));
  return store.paginate(all, params?.page, params?.pageSize);
}

export async function getAlertsBySupplier(supplierId: string): Promise<AlertEvent[]> {
  return store.alertEvents.filter((a) => a.supplierId === supplierId);
}

export async function getActiveAlerts(): Promise<AlertEvent[]> {
  return store.alertEvents.filter(
    (a) => a.status === "new" || a.status === "processing"
  );
}

export async function getAlertById(id: string): Promise<AlertEvent | undefined> {
  return store.alertEvents.get(id);
}

export async function updateAlert(
  id: string,
  patch: Partial<AlertEvent> & { handledBy?: string }
): Promise<AlertEvent | undefined> {
  if (patch.handledBy && !patch.handledAt) {
    patch.handledAt = new Date().toISOString();
  }
  return store.alertEvents.update(id, patch);
}

export async function runSupplierScan(supplierId: string): Promise<AlertEvent[]> {
  const [metrics, existingAlerts] = await Promise.all([
    getMetricsBySupplier(supplierId),
    getAlertsBySupplier(supplierId),
  ]);
  const newAlerts = MonitoringEngine.scan(supplierId, metrics, existingAlerts);
  for (const alert of newAlerts) {
    await store.alertEvents.create(alert);
  }
  return newAlerts;
}

export async function runGlobalScan(): Promise<AlertEvent[]> {
  const enterprises = await store.enterprises.filter((e) => e.role === "supplier");
  const allNew: AlertEvent[] = [];
  for (const ent of enterprises) {
    const alerts = await runSupplierScan(ent.id);
    allNew.push(...alerts);
  }
  return allNew;
}

export async function handleAlert(
  alertId: string,
  handler: {
    status: AlertEvent["status"];
    handledBy: string;
    notes: string;
    freezeLimit?: number;
  }
): Promise<AlertEvent | undefined> {
  return store.alertEvents.update(alertId, {
    status: handler.status,
    handledBy: handler.handledBy,
    handledAt: new Date().toISOString(),
    handlingNotes: handler.notes,
    frozenCreditLimit: handler.freezeLimit,
  });
}

export async function resolveAlert(
  alertId: string,
  handlerId: string,
  notes: string
): Promise<AlertEvent | undefined> {
  return handleAlert(alertId, {
    status: "resolved",
    handledBy: handlerId,
    notes,
  });
}

export async function dismissAlert(
  alertId: string,
  handlerId: string,
  notes: string
): Promise<AlertEvent | undefined> {
  return handleAlert(alertId, {
    status: "false_alarm",
    handledBy: handlerId,
    notes,
  });
}

export async function addMetric(
  metric: Omit<MonitoringMetrics, "id">
): Promise<MonitoringMetrics> {
  const full: MonitoringMetrics = {
    ...metric,
    id: `mm_${metric.supplierId}_${Date.now()}`,
  };
  return store.monitoringMetrics.create(full);
}

export const MonitoringService = {
  metricsBySupplier: getMetricsBySupplier,
  recentMetrics: getRecentMetrics,
  allAlerts: getAllAlerts,
  alertsBySupplier: getAlertsBySupplier,
  activeAlerts: getActiveAlerts,
  alertById: getAlertById,
  getAlertById,
  scanSupplier: runSupplierScan,
  scanGlobal: runGlobalScan,
  handleAlert,
  resolve: resolveAlert,
  dismiss: dismissAlert,
  addMetric,
  listAlerts,
  getMetrics,
  updateAlert,
};

export default MonitoringService;
