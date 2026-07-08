"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      // 1. Проверяем наличие подписки через наш API
      const response = await fetch(`/api/check-subscription?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при проверке почты.");
      }

      if (!data.active) {
        setError("Доступ закрыт. Указанный E-mail не найден в списке оплаченных подписок.");
        setIsSubmitting(false);
        return;
      }

      // 2. Если подписка активна:
      // В реальном Supabase мы бы отправили Magic Link. В MVP симуляции мы сразу перенаправляем в личный кабинет.
      setMessage("Вход выполнен успешно! Перенаправляем в личный кабинет...");
      
      setTimeout(() => {
        router.push(`/catalog?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Произошла ошибка при попытке входа.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6 py-12 font-sans">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-sm space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <button 
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            На главную
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-500" />
            Вход для клиентов
          </h2>
          <p className="text-slate-400 text-sm">
            Введите E-mail, указанный при покупке доступа к каталогу фабрик.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Ваш E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-600">
                <Mail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-rose-500/10 text-rose-400 p-3 rounded-lg border border-rose-500/20 text-xs">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">{error}</p>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="underline mt-1 font-bold block text-left"
                >
                  Купить доступ на главной странице
                </button>
              </div>
            </div>
          )}

          {message && (
            <p className="text-emerald-400 text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            Войти в кабинет
          </button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Нет аккаунта? <button onClick={() => router.push("/")} className="text-blue-400 hover:underline">Приобрести доступ</button>
          </p>
        </div>
      </div>
    </div>
  );
}
