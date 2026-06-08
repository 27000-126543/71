import { NextRequest, NextResponse } from "next/server";
import { RepaymentService } from "@/src/services/repaymentService";
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

    const record = await RepaymentService.deduct(params.id);

    return NextResponse.json(
      { success: true, message: "扣款成功", data: record },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "扣款失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
