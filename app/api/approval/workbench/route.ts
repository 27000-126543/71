import { NextRequest, NextResponse } from "next/server";
import { ApprovalService } from "@/src/services/approvalService";
import { AuthService } from "@/src/services/authService";
import type { ApprovalStatus } from "@/src/types";

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
    const result = await ApprovalService.getWorkbench(user.role, {
      status: (searchParams.get("status") as ApprovalStatus) || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      pageSize: searchParams.get("pageSize") ? parseInt(searchParams.get("pageSize")!) : undefined,
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取审批工作台失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
