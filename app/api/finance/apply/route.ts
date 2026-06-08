import { NextRequest, NextResponse } from "next/server";
import { FinanceService } from "@/src/services/financeService";
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
    const finance = await FinanceService.apply(body);

    return NextResponse.json(
      { success: true, message: "融资申请提交成功", data: finance },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "融资申请提交失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
