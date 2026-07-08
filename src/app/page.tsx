"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Shield, Globe, Zap, ArrowRight, CreditCard, Lock } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("•••");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Landing, 2: Checkout, 3: Processing, 4: Success
  const [error, setError] = useState("");

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Пожалуйста, введите корректный e-mail!");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Симулируем сетевую задержку
      setStep(3);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Отправляем запрос на наш API Webhook
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось обработать платеж на сервере.");
      }

      setStep(4);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при симуляции оплаты.");
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-extrabold tracking-wider text-sm">
              B2B
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Factory Hub
            </span>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all"
          >
            Войти в кабинет
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Side: Product Description */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/20">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
              MVP интерактивного прототипа
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              Получите доступ к базе данных проверенных фабрик
            </h1>
            <p className="text-slate-400 text-lg">
              Интерактивный каталог из 330+ текстильных и обувных фабрик Турции, Франции, Италии и Китая напрямую от поставщиков без посредников.
            </p>

            <ul className="space-y-3 pt-2">
              <li className="flex items-start gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded-md mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block">Прямые проверенные контакты</strong>
                  <span className="text-slate-400 text-sm">Email, номера телефонов и сайты представителей фабрик.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded-md mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block">Удобная фильтрация по MOQ</strong>
                  <span className="text-slate-400 text-sm">Фильтруйте по минимальному объему закупки под ваш бюджет.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-emerald-500/10 text-emerald-400 p-1 rounded-md mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-slate-200 block">Защита от копирования информации</strong>
                  <span className="text-slate-400 text-sm">Встроенная защита контента от массового выделения и парсинга.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Side: Step-by-Step Checkout Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl backdrop-blur-sm max-w-md w-full justify-self-center">
            {/* Step 1: Input Email Form */}
            {step === 1 && (
              <form onSubmit={handleStartPayment} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Получить Premium Доступ</h2>
                  <p className="text-slate-400 text-sm">
                    Введите E-mail, на который будет создана подписка и отправлен временный пароль для входа.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Ваш E-mail
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}

                  <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800/50">
                    <div>
                      <span className="text-xs text-slate-500 block">Стоимость тарифа</span>
                      <span className="text-lg font-bold text-white">4 900 ₽</span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-1 rounded-md border border-emerald-500/25">
                      Навсегда
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
                >
                  Купить доступ
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            {/* Step 2: Payment Details */}
            {step === 2 && (
              <form onSubmit={handleSimulatePayment} className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-blue-500" />
                    Оплата картой
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Симуляция безопасного шлюза Stripe.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Номер карты
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Срок действия
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        CVC / CVV
                      </label>
                      <input
                        type="text"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {error && <p className="text-rose-500 text-xs font-medium">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  Симулировать Оплату
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-slate-400 hover:text-white text-sm text-center block pt-2"
                >
                  Назад
                </button>
              </form>
            )}

            {/* Step 3: Processing Webhook */}
            {step === 3 && (
              <div className="text-center py-12 space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Выполняется оплата...</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    Скрипт симулирует вызов Webhook (Make.com), который добавляет ваш E-mail <strong className="text-slate-200">{email}</strong> в базу данных Supabase.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Success state */}
            {step === 4 && (
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 p-4 rounded-full mx-auto border border-emerald-500/30 flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Доступ активирован!</h3>
                  <p className="text-slate-400 text-sm">
                    Оплата прошла успешно! Робот добавил почту <strong className="text-slate-200">{email}</strong> в базу данных.
                  </p>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-left text-xs text-slate-400 space-y-1">
                    <p><strong>Параметры симуляции:</strong></p>
                    <p>• Роль: Клиент каталога</p>
                    <p>• E-mail: {email}</p>
                    <p>• Статус подписки: active</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/catalog?email=${encodeURIComponent(email)}`)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all"
                >
                  Перейти в каталог фабрик
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-slate-600 text-xs">
        <p>© 2026 B2B Factory Hub. Все права защищены. MVP интерактивного прототипа.</p>
      </footer>
    </div>
  );
}
