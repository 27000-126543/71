import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/src/services/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "账号和密码不能为空" },
        { status: 400 }
      );
    }

    const result = await AuthService.login(username, password);

    if (!result.success || !result.user) {
      const statusCode =
        result.message === "账号不存在" || result.message === "密码错误"
          ? 401
          : 401;
      return NextResponse.json(
        { success: false, message: result.message || "登录失败" },
        { status: statusCode }
      );
    }

    const { password: _p, ...safeUser } = (result.user || {}) as any;
    void _p;
    const response = NextResponse.json(
      { success: true, message: "登录成功", data: { user: safeUser } },
      { status: 200 }
    );

    if (result.token) {
      response.cookies.set({
        name: "auth_token",
        value: result.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return NextResponse.json(
      { success: false, message },
      { status: 401 }
    );
  }
}
