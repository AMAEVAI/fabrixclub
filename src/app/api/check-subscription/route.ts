import { NextResponse } from "next/server";
import { checkSubscription } from "@/utils/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ active: false, error: "Email is required" }, { status: 400 });
  }

  const active = await checkSubscription(email);
  return NextResponse.json({ active });
}
