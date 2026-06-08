import type { Enterprise, SupplierBinding, UserRole, PaginatedResult } from "@/src/types";
import { store } from "@/src/data/store";

export async function getEnterpriseById(id: string): Promise<Enterprise | undefined> {
  return store.enterprises.get(id);
}

export async function getAllEnterprises(): Promise<Enterprise[]> {
  return store.enterprises.all();
}

export async function getCoreEnterprises(): Promise<Enterprise[]> {
  return store.enterprises.filter((e) => e.role === "core_enterprise");
}

export async function getSuppliers(): Promise<Enterprise[]> {
  return store.enterprises.filter((e) => e.role === "supplier");
}

export async function list(params?: {
  role?: string;
  certificationStatus?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Enterprise>> {
  let all = await store.enterprises.all();
  if (params?.role) {
    all = all.filter((e) => e.role === params.role);
  }
  if (params?.certificationStatus) {
    all = all.filter((e) => e.certificationStatus === params.certificationStatus);
  }
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    all = all.filter(
      (e) =>
        e.name.toLowerCase().includes(kw) ||
        e.unifiedCreditCode.toLowerCase().includes(kw) ||
        e.legalPerson.toLowerCase().includes(kw)
    );
  }
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return store.paginate(all, params?.page, params?.pageSize);
}

export async function register(input: Omit<Enterprise, "id" | "createdAt" | "certificationStatus"> & { certificationStatus?: Enterprise["certificationStatus"] }): Promise<Enterprise> {
  const ent: Enterprise = {
    ...input,
    id: `e_${Date.now()}`,
    createdAt: new Date().toISOString(),
    certificationStatus: input.certificationStatus || "pending",
  };
  return store.enterprises.create(ent);
}

export async function getSuppliersByCore(coreEnterpriseId: string): Promise<Enterprise[]> {
  const bindings = await store.supplierBindings.filter(
    (b) => b.coreEnterpriseId === coreEnterpriseId && b.status === "active"
  );
  const supplierIds = bindings.map((b) => b.supplierId);
  const all = await store.enterprises.all();
  return all.filter((e) => supplierIds.includes(e.id));
}

export async function getBindingsByCore(coreEnterpriseId: string): Promise<SupplierBinding[]> {
  return store.supplierBindings.filter((b) => b.coreEnterpriseId === coreEnterpriseId);
}

export async function getBindingsBySupplier(supplierId: string): Promise<SupplierBinding[]> {
  return store.supplierBindings.filter((b) => b.supplierId === supplierId);
}

export async function getBinding(
  coreEnterpriseId: string,
  supplierId: string
): Promise<SupplierBinding | undefined> {
  const bindings = await store.supplierBindings.filter(
    (b) => b.coreEnterpriseId === coreEnterpriseId && b.supplierId === supplierId
  );
  return bindings[0];
}

export async function createEnterprise(input: Omit<Enterprise, "id" | "createdAt">): Promise<Enterprise> {
  const ent: Enterprise = {
    ...input,
    id: `e_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return store.enterprises.create(ent);
}

export async function updateEnterprise(
  id: string,
  patch: Partial<Enterprise>
): Promise<Enterprise | undefined> {
  return store.enterprises.update(id, patch);
}

export async function bindSupplier(
  coreEnterpriseId: string,
  supplierId: string,
  annualTransactionVolume: number = 0
): Promise<SupplierBinding> {
  const existing = await getBinding(coreEnterpriseId, supplierId);
  if (existing) {
    const updated = await store.supplierBindings.update(existing.id, {
      status: "active",
      annualTransactionVolume,
    });
    if (updated) return updated;
  }
  const binding: SupplierBinding = {
    id: `b_${Date.now()}`,
    coreEnterpriseId,
    supplierId,
    cooperationSince: new Date().toISOString(),
    annualTransactionVolume,
    status: "active",
  };
  return store.supplierBindings.create(binding);
}

export async function unbindSupplier(bindingId: string): Promise<boolean> {
  const updated = await store.supplierBindings.update(bindingId, { status: "terminated" });
  return !!updated;
}

export async function verifyEnterprise(id: string): Promise<Enterprise | undefined> {
  return store.enterprises.update(id, { certificationStatus: "verified" });
}

export async function rejectEnterprise(id: string): Promise<Enterprise | undefined> {
  return store.enterprises.update(id, { certificationStatus: "rejected" });
}

export async function searchEnterprises(keyword: string, role?: UserRole): Promise<Enterprise[]> {
  const all = await store.enterprises.all();
  const lower = keyword.toLowerCase();
  return all.filter((e) => {
    const matchRole = !role || e.role === role;
    const matchKw =
      e.name.toLowerCase().includes(lower) ||
      e.unifiedCreditCode.toLowerCase().includes(lower) ||
      e.legalPerson.toLowerCase().includes(lower) ||
      (e.industry && e.industry.toLowerCase().includes(lower));
    return matchRole && matchKw;
  });
}

export const EnterpriseService = {
  getById: getEnterpriseById,
  all: getAllEnterprises,
  cores: getCoreEnterprises,
  suppliers: getSuppliers,
  suppliersByCore: getSuppliersByCore,
  bindingsByCore: getBindingsByCore,
  bindingsBySupplier: getBindingsBySupplier,
  getBinding,
  create: createEnterprise,
  update: updateEnterprise,
  bind: bindSupplier,
  unbind: unbindSupplier,
  verify: verifyEnterprise,
  reject: rejectEnterprise,
  search: searchEnterprises,
  list,
  register,
};

export default EnterpriseService;
