import { NextRequest, NextResponse } from "next/server";
import { EnterpriseService } from "@/src/services/enterpriseService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const enterprise = await EnterpriseService.register(body);

    return NextResponse.json(
      { success: true, message: "企业注册成功，等待审核", data: enterprise },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "企业注册失败";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
