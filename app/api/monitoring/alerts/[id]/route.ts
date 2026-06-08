import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/src/services/monitoringService";
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

    const alert = await MonitoringService.getAlertById(params.id);
    if (!alert) {
      return NextResponse.json(
        { success: false, message: "预警不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: alert },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取预警失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

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
    const alert = await MonitoringService.updateAlert(params.id, {
      ...body,
      handledBy: body.handledBy || user.id,
    });

    return NextResponse.json(
      { success: true, message: "预警已更新", data: alert },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "预警更新失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
