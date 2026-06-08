import { NextRequest, NextResponse } from "next/server";
import { RepaymentService } from "@/src/services/repaymentService";
import { AuthService } from "@/src/services/authService";

export async function PATCH(
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
    const { status, note } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "缺少 status 参数" },
        { status: 400 }
      );
    }

    const updated = await RepaymentService.updateStatus(
      params.id,
      status,
      user.name,
      note
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "催收工单不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "更新成功", data: updated },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
