import { NextResponse } from "next/server";
import { getSubscriptions, addSubscription, deleteSubscription } from "@/utils/db";

function isAuthorized(req: Request) {
  const { searchParams } = new URL(req.url);
  const adminEmail = searchParams.get("adminEmail") || req.headers.get("x-admin-email");
  return adminEmail?.trim().toLowerCase() === "amaev.pro@gmail.com";
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const list = await getSubscriptions();
    return NextResponse.json({ subscriptions: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const { email, status } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await addSubscription(email, status || "active");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await deleteSubscription(email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
