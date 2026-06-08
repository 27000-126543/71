import { NextRequest, NextResponse } from "next/server";
import { RepaymentService } from "@/src/services/repaymentService";
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
    let cases = await RepaymentService.allCollections();

    const status = searchParams.get("status");
    if (status) {
      cases = cases.filter((c) => c.status === status);
    }
    const financeApplicationId = searchParams.get("financeApplicationId");
    if (financeApplicationId) {
      cases = cases.filter((c) => c.financeApplicationId === financeApplicationId);
    }
    const assignedTo = searchParams.get("assignedTo");
    if (assignedTo) {
      cases = cases.filter((c) => c.assignedTo === assignedTo);
    }
    const caseNo = searchParams.get("caseNo");
    if (caseNo) {
      cases = cases.filter((c) => c.caseNo === caseNo);
    }

    return NextResponse.json(
      { success: true, data: cases },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取催收案件列表失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

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
