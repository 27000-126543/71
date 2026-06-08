import { NextRequest, NextResponse } from "next/server";
import { FinanceService } from "@/src/services/financeService";
import { AuthService } from "@/src/services/authService";
import type { FinanceStatus } from "@/src/types";

export async function GET(request: NextRequest) {
  try {
    const token = AuthService.extractToken(request.cookies.get("auth_token")?.value);
    if (!token) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const user = await AuthService.getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "登录已过期" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const result = await FinanceService.list({
      supplierId: searchParams.get("supplierId") || undefined,
      coreEnterpriseId: searchParams.get("coreEnterpriseId") || undefined,
      status: (searchParams.get("status") as FinanceStatus) || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : undefined,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取融资列表失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
