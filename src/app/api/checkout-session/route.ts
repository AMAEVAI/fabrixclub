import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      // Если ключ Stripe не настроен, возвращаем ошибку конфигурации
      return NextResponse.json({ 
        error: "Stripe не настроен. Пожалуйста, добавьте STRIPE_SECRET_KEY в переменные окружения." 
      }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24" as any,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fabrixclub.vercel.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Доступ к базе фабрик Fabrixclub",
              description: "Единоразовый доступ к каталогу 483 текстильных и обувных фабрик.",
            },
            unit_amount: 4900, // 49.00 USD
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: email.trim().toLowerCase(),
      metadata: {
        email: email.trim().toLowerCase(),
      },
      success_url: `${appUrl}/catalog?email=${encodeURIComponent(email.trim().toLowerCase())}`,
      cancel_url: `${appUrl}/`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
