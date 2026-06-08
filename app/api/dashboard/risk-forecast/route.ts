import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from "@/src/services/dashboardService";
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

    const forecasts = await DashboardService.getRiskForecast();

    return NextResponse.json(
      { success: true, data: forecasts },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取风险预测失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
