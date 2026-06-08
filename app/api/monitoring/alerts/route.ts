import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/src/services/monitoringService";
import { AuthService } from "@/src/services/authService";

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
    const result = await MonitoringService.listAlerts({
      supplierId: searchParams.get("supplierId") || undefined,
      status: searchParams.get("status") || undefined,
      level: searchParams.get("level") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : undefined,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取预警列表失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
