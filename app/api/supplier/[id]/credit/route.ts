import { NextRequest, NextResponse } from "next/server";
import { SupplierService } from "@/src/services/supplierService";
import { AuthService } from "@/src/services/authService";

export async function GET(
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

    const credit = await SupplierService.getCreditScore(params.id);
    if (!credit) {
      return NextResponse.json(
        { success: false, message: "信用评分不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: credit },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取信用评分失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
