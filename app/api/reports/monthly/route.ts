import { NextRequest, NextResponse } from "next/server";
import { ReportsService } from "@/src/services/reportsService";
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
    const report = await ReportsService.getMonthlyReport(
      searchParams.get("month") || undefined
    );

    return NextResponse.json(
      { success: true, data: report },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取月度报告失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
