import { NextResponse } from "next/server";
import { addSubscription } from "@/utils/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, status } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Сохраняем подписку в БД (Supabase или Локальный JSON)
    const result = await addSubscription(email, status || "active");

    return NextResponse.json({
      success: true,
      message: "Subscription successfully updated via webhook simulation.",
      data: result,
    });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
