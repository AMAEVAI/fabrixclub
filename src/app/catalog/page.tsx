import { checkSubscription, getFactories } from "@/utils/db";
import CatalogDashboard from "./CatalogDashboard";
import { Lock, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email || "";

  // 1. Проверяем подписку
  const isSubscribed = email ? await checkSubscription(email) : false;

  // 2. Если подписки нет — показываем экран блокировки
  if (!isSubscribed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl backdrop-blur-sm">
          
          <div className="w-16 h-16 bg-rose-500/10 text-rose-400 p-4 rounded-full mx-auto border border-rose-500/30 flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Доступ ограничен</h1>
            <p className="text-slate-400 text-sm">
              Для просмотра базы данных фабрик необходим Premium доступ.
            </p>
            {email && (
              <p className="text-rose-400/90 text-xs bg-rose-500/5 border border-rose-500/15 py-2 px-3 rounded-lg mt-2">
                Адрес <strong className="text-rose-300">{email}</strong> не имеет активной подписки.
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              Приобрести Premium доступ
            </Link>
            <Link
              href="/login"
              className="w-full bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              Войти под другим E-mail
            </Link>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Вернуться на главную страницу
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // 3. Если подписка активна — загружаем фабрики и рендерим каталог
  const factories = await getFactories();

  return <CatalogDashboard factories={factories} email={email} />;
}
