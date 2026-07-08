"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2, UserPlus, ShieldAlert, Users, Database, ShieldCheck } from "lucide-react";

interface Subscription {
  id?: string;
  email: string;
  status: string;
  paid_at?: string;
  expires_at?: string;
}

function AdminPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminEmail = searchParams.get("email");

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAuthorized = useMemo(() => {
    return adminEmail?.trim().toLowerCase() === "amaev.pro@gmail.com";
  }, [adminEmail]);

  useEffect(() => {
    if (!isAuthorized) {
      setIsLoading(false);
      return;
    }

    fetchSubscriptions();
  }, [isAuthorized, adminEmail]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`/api/admin/subscriptions?adminEmail=${encodeURIComponent(adminEmail || "")}`);
      if (!response.ok) {
        throw new Error("Не удалось загрузить список подписчиков");
      }
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (err: any) {
      setError(err.message || "Произошла неизвестная ошибка при загрузке данных.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/subscriptions?adminEmail=${encodeURIComponent(adminEmail || "")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim().toLowerCase(), status: "active" }),
      });

      if (!response.ok) {
        throw new Error("Не удалось добавить подписчика.");
      }

      setSuccess(`Пользователь ${newEmail} успешно добавлен!`);
      setNewEmail("");
      await fetchSubscriptions();
    } catch (err: any) {
      setError(err.message || "Ошибка при добавлении.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubscriber = async (emailToDelete: string) => {
    if (!confirm(`Вы действительно хотите аннулировать подписку для ${emailToDelete}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/subscriptions?adminEmail=${encodeURIComponent(adminEmail || "")}&email=${encodeURIComponent(emailToDelete)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Не удалось удалить подписку.");
      }

      setSuccess(`Доступ для ${emailToDelete} успешно закрыт.`);
      await fetchSubscriptions();
    } catch (err: any) {
      setError(err.message || "Ошибка при удалении.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Загрузка панели администратора...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-8 text-center space-y-6">
          <div className="bg-red-500/10 text-red-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white">403 Доступ запрещен</h1>
            <p className="text-slate-400 text-sm">
              Эта панель предназначена исключительно для администратора проекта. У вас нет доступа к этой странице.
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-extrabold tracking-wider text-xs">
              FABRIX
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              club <span className="text-blue-500 text-xs font-mono ml-1">ADMIN</span>
            </span>
          </div>

          <button
            onClick={() => router.push(`/catalog?email=${encodeURIComponent(adminEmail || "")}`)}
            className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            В каталог фабрик
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Status Indicators / Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-4">
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-xl border border-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Всего подписчиков</p>
              <p className="text-2xl font-bold text-white mt-1">{subscriptions.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-4">
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Роль доступа</p>
              <p className="text-base font-bold text-emerald-400 mt-1">Супер-администратор</p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex items-center gap-4">
            <div className="bg-purple-500/10 text-purple-400 p-3 rounded-xl border border-purple-500/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">База данных Supabase</p>
              <p className="text-sm font-semibold text-white mt-1 truncate max-w-[180px]">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Подключена (Облако)" : "Локальный режим"}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/15 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Add Subscriber Panel */}
          <div className="md:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 h-fit">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              Добавить доступ вручную
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              Введите email клиента. После нажатия кнопки клиент сможет мгновенно войти в каталог по своей почте без оплаты.
            </p>
            <form onSubmit={handleAddSubscriber} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">E-mail клиента</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-600 focus:outline-none px-4 py-3 rounded-xl text-sm transition-colors text-white placeholder-slate-600"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-medium py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Добавление..." : "Предоставить доступ"}
              </button>
            </form>
          </div>

          {/* Subscribers List */}
          <div className="md:col-span-2 bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Список клиентов с доступом ({subscriptions.length})</h2>
            
            <div className="overflow-x-auto border border-slate-900 rounded-xl bg-slate-950/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-xs text-slate-500 font-semibold bg-slate-950/80">
                    <th className="px-4 py-3.5">E-mail</th>
                    <th className="px-4 py-3.5">Дата оплаты</th>
                    <th className="px-4 py-3.5">Статус</th>
                    <th className="px-4 py-3.5 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs">
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        Список подписчиков пока пуст.
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((sub) => (
                      <tr key={sub.email} className="hover:bg-slate-900/25 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-slate-200">{sub.email}</td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {sub.paid_at ? new Date(sub.paid_at).toLocaleDateString("ru-RU") : "N/A"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {sub.email === "amaev.pro@gmail.com" ? (
                            <span className="text-[10px] text-slate-500 italic mr-2">Нельзя удалить</span>
                          ) : (
                            <button
                              onClick={() => handleDeleteSubscriber(sub.email)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Аннулировать доступ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Загрузка панели администратора...</p>
        </div>
      </div>
    }>
      <AdminPageInner />
    </Suspense>
  );
}
