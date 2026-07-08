import { NextResponse } from "next/server";
import { addSubscription } from "@/utils/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");

  // Если это запрос от Stripe (присутствует заголовок сигнатуры)
  if (signature && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24" as any,
      });

      const body = await req.text();
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.email || session.customer_details?.email;
        
        if (email) {
          console.log(`[Stripe Webhook] Успешная оплата для: ${email}`);
          await addSubscription(email.trim().toLowerCase(), "active");
        }
      }

      return NextResponse.json({ received: true });
    } catch (err: any) {
      console.error(`[Stripe Webhook Error] ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  }

  // Fallback / Локальная симуляция оплаты (без сигнатуры)
  try {
    const { email, status } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    console.log(`[Simulated Webhook] Добавление подписки для: ${email}`);
    await addSubscription(email.trim().toLowerCase(), status || "active");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Manual/Simulated webhook error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
