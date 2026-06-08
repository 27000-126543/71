import { NextRequest, NextResponse } from "next/server";
import { SupplierService } from "@/src/services/supplierService";
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
    const bindings = await SupplierService.listBindings({
      coreEnterpriseId: searchParams.get("coreEnterpriseId") || undefined,
      supplierId: searchParams.get("supplierId") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return NextResponse.json(
      { success: true, data: bindings },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取绑定关系列表失败";
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
    const { coreEnterpriseId, supplierId } = body;

    if (!coreEnterpriseId || !supplierId) {
      return NextResponse.json(
        { success: false, message: "核心企业ID和供应商ID不能为空" },
        { status: 400 }
      );
    }

    const binding = await SupplierService.bind(coreEnterpriseId, supplierId);

    return NextResponse.json(
      { success: true, message: "绑定成功", data: binding },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "绑定失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { bindingId } = body;

    if (!bindingId) {
      return NextResponse.json(
        { success: false, message: "绑定关系ID不能为空" },
        { status: 400 }
      );
    }

    await SupplierService.unbind(bindingId);

    return NextResponse.json(
      { success: true, message: "解绑成功" },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "解绑失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
