import type { SupplierBinding, CreditScore, TransactionOrder } from "@/src/types";
import { store } from "@/src/data/store";
import { CreditService } from "@/src/services/CreditService";

export async function listBindings(options?: {
  coreEnterpriseId?: string;
  supplierId?: string;
  status?: string;
}): Promise<SupplierBinding[]> {
  let all = await store.supplierBindings.all();
  if (options?.coreEnterpriseId) {
    all = all.filter((b) => b.coreEnterpriseId === options.coreEnterpriseId);
  }
  if (options?.supplierId) {
    all = all.filter((b) => b.supplierId === options.supplierId);
  }
  if (options?.status) {
    all = all.filter((b) => b.status === options.status);
  }
  return all;
}

export async function bind(coreEnterpriseId: string, supplierId: string): Promise<SupplierBinding> {
  const existing = await store.supplierBindings.filter(
    (b) => b.coreEnterpriseId === coreEnterpriseId && b.supplierId === supplierId
  );
  if (existing.length > 0 && existing[0].status === "active") {
    throw new Error("该绑定关系已存在");
  }
  if (existing.length > 0) {
    const updated = await store.supplierBindings.update(existing[0].id, { status: "active" });
    if (updated) return updated;
  }
  const binding: SupplierBinding = {
    id: `b_${Date.now()}`,
    coreEnterpriseId,
    supplierId,
    cooperationSince: new Date().toISOString(),
    annualTransactionVolume: 0,
    status: "active",
  };
  return store.supplierBindings.create(binding);
}

export async function unbind(bindingId: string): Promise<void> {
  const updated = await store.supplierBindings.update(bindingId, { status: "terminated" });
  if (!updated) {
    throw new Error("绑定关系不存在");
  }
}

export async function getCreditScore(supplierId: string): Promise<CreditScore | undefined> {
  return CreditService.getBySupplier(supplierId);
}

export async function refreshCreditScore(supplierId: string): Promise<CreditScore | undefined> {
  return CreditService.refresh(supplierId);
}

export async function getOrders(supplierId: string, options?: { status?: string; limit?: number }): Promise<TransactionOrder[]> {
  let filtered = await store.orders.filter((o) => o.supplierId === supplierId);
  if (options?.status) {
    filtered = filtered.filter((o) => o.status === options.status);
  }
  filtered.sort((a, b) => (a.orderDate < b.orderDate ? 1 : -1));
  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  return filtered;
}

export const SupplierService = {
  listBindings,
  bind,
  unbind,
  getCreditScore,
  refreshCreditScore,
  getOrders,
};

export default SupplierService;
