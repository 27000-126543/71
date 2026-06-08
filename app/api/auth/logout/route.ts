import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/src/services/authService";

export async function POST(request: NextRequest) {
  try {
    const token = AuthService.extractToken(request.cookies.get("auth_token")?.value);
    if (token) {
      await AuthService.logout(token);
    }

    const response = NextResponse.json(
      { success: true, message: "退出成功" },
      { status: 200 }
    );

    response.cookies.set({
      name: "auth_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "退出失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
