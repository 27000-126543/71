import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/src/services/reportsService";
import { AuthService } from "@/src/services/authService";

export async function POST(request: NextRequest) {
  try {
    const token = AuthService.extractToken(request.cookies.get("auth_token")?.value);
    if (!token) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }
    const user = await AuthService.getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ success: false, message: "登录已过期" }, { status: 401 });
    }

    const body = await request.json();
    const { format, month } = body;

    const result = await ReportsService.exportReport(
      (format as "xlsx" | "pdf") || "xlsx",
      month || undefined
    );

    return NextResponse.json(
      { success: true, message: "报告导出成功", data: result },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "报告导出失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
