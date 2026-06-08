import { NextRequest, NextResponse } from "next/server";
import { ApprovalService } from "@/src/services/approvalService";
import { AuthService } from "@/src/services/authService";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { decision, comment } = body;

    if (!decision || !["approve", "reject", "escalate"].includes(decision)) {
      return NextResponse.json(
        { success: false, message: "决策参数无效" },
        { status: 400 }
      );
    }

    const workflow = await ApprovalService.decide(
      params.id,
      user.id,
      decision as "approve" | "reject" | "escalate",
      comment || ""
    );

    return NextResponse.json(
      { success: true, message: "审批决策已提交", data: workflow },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "审批决策提交失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
