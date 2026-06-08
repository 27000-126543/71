import { NextRequest, NextResponse } from "next/server";
import { RepaymentService } from "@/src/services/repaymentService";
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
    const case_ = await RepaymentService.createCollectionCase({
      ...body,
      assignedTo: body.assignedTo || user.id,
    });

    return NextResponse.json(
      { success: true, message: "催收案件已创建", data: case_ },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建催收案件失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
