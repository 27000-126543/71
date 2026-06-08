import { NextRequest, NextResponse } from "next/server";
import { EnterpriseService } from "@/src/services/enterpriseService";
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

    const enterprise = await EnterpriseService.getById(params.id);
    if (!enterprise) {
      return NextResponse.json(
        { success: false, message: "企业不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: enterprise },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取企业信息失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
