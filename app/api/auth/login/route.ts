import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/src/services/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const result = await AuthService.login(username, password);

    const response = NextResponse.json(
      { success: true, message: "登录成功", data: { user: result.user } },
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
