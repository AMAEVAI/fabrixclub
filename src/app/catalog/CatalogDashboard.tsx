"use client";

import { useState, useMemo } from "react";
import { Search, Globe, ShieldAlert, SlidersHorizontal, LogOut, Star, Phone, Mail, Link as LinkIcon, Compass, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface Factory {
  id: number;
  name: string;
  country: string;
  flag: string;
  category: string;
  brands: string;
  niche: string;
  MOQ: string;
  moqCategory: string;
  contact: string;
  phone: string;
  site: string;
  rating: number;
}

interface CatalogDashboardProps {
  factories: Factory[];
  email: string;
}

export default function CatalogDashboard({ factories, email }: CatalogDashboardProps) {
  const router = useRouter();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedMoq, setSelectedMoq] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [expandedContacts, setExpandedContacts] = useState<Record<number, boolean>>({});

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("All");
    setSelectedMoq("All");
    setSelectedCategory("All");
  };

  // Toggle contacts visibility
  const toggleContacts = (id: number) => {
    setExpandedContacts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter Logic
  const filteredFactories = useMemo(() => {
    return factories.filter(factory => {
      const matchesSearch = 
        factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.brands.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factory.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCountry = selectedCountry === "All" || factory.country === selectedCountry;
      const matchesMoq = selectedMoq === "All" || factory.moqCategory === selectedMoq;
      
      let matchesCategory = true;
      if (selectedCategory !== "All") {
        matchesCategory = factory.category.toLowerCase().includes(selectedCategory.toLowerCase());
      }

      return matchesSearch && matchesCountry && matchesMoq && matchesCategory;
    });
  }, [factories, searchTerm, selectedCountry, selectedMoq, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Upper Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-extrabold tracking-wider text-xs">FABRIX</div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">club</span>
            </div>
            
            {/* View Mode Switcher */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex gap-1 text-xs">
              <button
                onClick={() => setViewMode("desktop")}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${viewMode === "desktop" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                ПК Версия
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${viewMode === "mobile" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
              >
                Мобильная
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {email === "amaev.pro@gmail.com" && (
              <button
                onClick={() => router.push(`/admin?email=${encodeURIComponent(email)}`)}
                className="text-xs bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-xl font-bold transition-all"
              >
                Админка
              </button>
            )}
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold max-w-[200px] truncate hidden md:inline">
              Premium • {email}
            </span>
            <button
              onClick={() => router.push("/")}
              className="text-slate-400 hover:text-white hover:bg-slate-900 p-2 rounded-lg transition-all"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        
        {/* Dynamic Warning (Security Rules info) */}
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-4 flex gap-3 text-sm text-slate-400">
          <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p>
            Каталог защищен политиками безопасности <strong>Row Level Security (RLS)</strong> и защитой от выделения текста. Доступ открыт исключительно для почты <span className="text-slate-200 underline font-semibold">{email}</span>.
          </p>
        </div>

        {/* Outer frame mirroring responsive simulation */}
        <div className={`w-full mx-auto transition-all duration-300 ${viewMode === "mobile" ? "max-w-md border border-slate-800 rounded-[2.5rem] p-4 bg-slate-950 shadow-2xl relative" : ""}`}>
          {viewMode === "mobile" && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-full z-10"></div>
          )}
          
          <div className={`flex flex-col gap-6 ${viewMode === "mobile" ? "bg-slate-950/80 min-h-[600px] max-h-[800px] overflow-y-auto pt-4 px-2 rounded-3xl" : ""}`}>
            
            {/* Header section in mobile / search section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">База данных фабрик</h2>
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="text"
                  placeholder="Поиск по названию, стилю, бренду..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Layout split based on ViewMode */}
            <div className={`grid gap-6 ${viewMode === "desktop" ? "md:grid-cols-4" : "grid-cols-1"}`}>
              
              {/* Filters Sidebar */}
              <div className={`space-y-6 ${viewMode === "desktop" ? "col-span-1 bg-slate-900/30 border border-slate-900 p-5 rounded-2xl" : "bg-slate-900/10 border border-slate-900/50 p-4 rounded-xl"}`}>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <span className="font-bold text-sm tracking-wide text-slate-300 uppercase flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                    Фильтры
                  </span>
                  <button 
                    onClick={handleResetFilters}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Сбросить
                  </button>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Страна</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "Турция", "Италия", "Франция", "Китай"].map(country => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          selectedCountry === country 
                            ? "bg-blue-600 border-blue-500 text-white font-semibold" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {country === "All" ? "Все" : country}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MOQ Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Минимальный заказ (MOQ)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "All", label: "Все" },
                      { key: "low", label: "Мелкий (до 100)" },
                      { key: "medium", label: "Средний (100-300)" },
                      { key: "high", label: "Крупный (500+)" }
                    ].map(moq => (
                      <button
                        key={moq.key}
                        onClick={() => setSelectedMoq(moq.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          selectedMoq === moq.key 
                            ? "bg-blue-600 border-blue-500 text-white font-semibold" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {moq.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Категория</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "All", label: "Все" },
                      { key: "одежда", label: "Одежда" },
                      { key: "обувь", label: "Обувь" },
                      { key: "материалы", label: "Ткани" }
                    ].map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                          selectedCategory === cat.key 
                            ? "bg-blue-600 border-blue-500 text-white font-semibold" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Factories Grid */}
              <div className={`space-y-4 ${viewMode === "desktop" ? "col-span-3" : "w-full"}`}>
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-900 pb-2">
                  <span>Найдено фабрик: {filteredFactories.length}</span>
                  {selectedCountry !== "All" && <span>Фильтр: {selectedCountry}</span>}
                </div>

                {filteredFactories.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl">
                    <Compass className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
                    <p className="text-slate-500 font-medium">Ничего не найдено...</p>
                    <p className="text-slate-650 text-xs mt-1">Попробуйте изменить параметры фильтрации или поисковый запрос.</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === "desktop" ? "grid-cols-2" : "grid-cols-1"}`}>
                    {filteredFactories.map(factory => (
                      <div 
                        key={factory.id} 
                        className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden"
                      >
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                        
                        <div className="space-y-3">
                          
                          {/* Title and Country */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-bold text-white tracking-tight">{factory.name}</h3>
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                                <span>{factory.flag}</span>
                                <span>{factory.country}</span>
                              </span>
                            </div>
                            
                            {/* Rating badge */}
                            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-lg text-xs font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                              {(typeof factory.rating === 'number' ? factory.rating : 4.5).toFixed(1)}
                            </span>
                          </div>

                          {/* Categories/niche */}
                          <div className="space-y-1 text-xs">
                            <p className="text-slate-300 flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <strong>Категория:</strong> {factory.category}
                            </p>
                            <p className="text-slate-400">
                              <strong>Ниша:</strong> {factory.niche}
                            </p>
                            <p className="text-slate-500 italic">
                              <strong>Работают с:</strong> {factory.brands}
                            </p>
                          </div>

                          {/* MOQ block */}
                          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-900/50 flex justify-between items-center text-xs">
                            <span className="text-slate-500">Минимальный объем (MOQ):</span>
                            <span className={`px-2 py-1 rounded-md font-bold ${
                              factory.moqCategory === 'low' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' 
                                : factory.moqCategory === 'medium' 
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25' 
                                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                            }`}>
                              {factory.MOQ}
                            </span>
                          </div>

                          {/* Contact Details (Expandable) */}
                          {expandedContacts[factory.id] && (
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 text-xs space-y-2.5 animate-fadeIn">
                              {factory.contact && factory.contact !== 'N/A' && (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                  <a href={`mailto:${factory.contact}`} className="hover:underline hover:text-white truncate">
                                    {factory.contact}
                                  </a>
                                </div>
                              )}
                              {factory.phone && factory.phone !== 'N/A' && (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                  <a href={`tel:${factory.phone}`} className="hover:underline hover:text-white">
                                    {factory.phone}
                                  </a>
                                </div>
                              )}
                              {factory.site && factory.site !== 'N/A' && (
                                <div className="flex items-center gap-2 text-slate-300">
                                  <LinkIcon className="w-4 h-4 text-blue-400 shrink-0" />
                                  <a href={factory.site} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white truncate flex items-center gap-1 text-blue-400">
                                    {factory.site.replace("https://", "").replace("http://", "")}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                        </div>

                        {/* Toggle button */}
                        <div className="mt-4 pt-3 border-t border-slate-900/50">
                          <button
                            onClick={() => toggleContacts(factory.id)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                          >
                            {expandedContacts[factory.id] ? "Скрыть контакты" : "Показать контакты"}
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
