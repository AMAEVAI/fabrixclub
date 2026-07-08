import fs from "fs";
import path from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const LOCAL_DB_PATH = path.join(process.cwd(), "local_db.json");
const LOCAL_FACTORIES_PATH = path.join(process.cwd(), "local_factories.json");

// Проверяем, настроены ли реальные переменные окружения Supabase
const hasRealSupabase = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key";

// Создаем инстанс Supabase только если ключи настроены
const supabase = hasRealSupabase 
  ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) 
  : null;

// Стандартные демонстрационные данные фабрик
export const MOCK_FACTORIES = [
  { id: 1, name: "Sefa Textile", country: "Турция", flag: "🇹🇷", category: "Одежда (Knitwear)", brands: "Ted Baker, Zara, Mango", niche: "Premium Casual Wear", MOQ: "100-300", moqCategory: "medium", contact: "info@sefatextile.com", phone: "+90 212 555 1234", site: "https://sefatextile.com", rating: 4.8 },
  { id: 2, name: "Beyond Garments", country: "Турция", flag: "🇹🇷", category: "Одежда (Denim)", brands: "Diesel, Calvin Klein", niche: "Eco-friendly Denim", MOQ: "500+", moqCategory: "high", contact: "contact@beyondgarments.tr", phone: "+90 212 987 6543", site: "https://beyondgarments.tr", rating: 4.6 },
  { id: 3, name: "Atelier Parisien", country: "Франция", flag: "🇫🇷", category: "Одежда (Luxury)", brands: "Chanel, Dior (Subcontractor)", niche: "High-End Silk & Velvet", MOQ: "10-50", moqCategory: "low", contact: "production@atelierparisien.fr", phone: "+33 1 42 68 53 00", site: "https://atelierparisien.fr", rating: 4.9 },
  { id: 4, name: "Tessitura Rossi", country: "Италия", flag: "🇮🇹", category: "Ткани и Материалы", brands: "Armani, Zegna", niche: "Loro Piana level wools", MOQ: "50м+", moqCategory: "low", contact: "sales@tessiturarossi.it", phone: "+39 02 888 999", site: "https://tessiturarossi.it", rating: 4.7 },
  { id: 5, name: "Shenzhen Apparel Group", country: "Китай", flag: "🇨🇳", category: "Спорт и Активный отдых", brands: "Under Armour, Nike", niche: "Tech-wear & Activewear", MOQ: "1000+", moqCategory: "high", contact: "export@szapparel.cn", phone: "+86 755 1234 5678", site: "https://szapparel.cn", rating: 4.5 },
  { id: 6, name: "Moda Italia", country: "Италия", flag: "🇮🇹", category: "Обувь", brands: "Gucci, Prada (Subcontractor)", niche: "Premium Leather Shoes", MOQ: "50-100", moqCategory: "low", contact: "info@modaitalia.it", phone: "+39 02 777 888", site: "https://modaitalia.it", rating: 4.8 }
];

// Чтение локальной БД подписок
function readLocalDb(): { subscriptions: any[] } {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    return { subscriptions: [] };
  }
  try {
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return { subscriptions: [] };
  }
}

// Запись в локальную БД подписок
function writeLocalDb(data: { subscriptions: any[] }) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function addSubscription(email: string, status: string = "active") {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (hasRealSupabase && supabase) {
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({ email: normalizedEmail, status, paid_at: new Date().toISOString() })
      .select();
    if (error) throw error;
    return data;
  } else {
    const db = readLocalDb();
    const existingIdx = db.subscriptions.findIndex(s => s.email === normalizedEmail);
    const subscription = {
      email: normalizedEmail,
      status,
      paid_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    if (existingIdx >= 0) {
      db.subscriptions[existingIdx] = subscription;
    } else {
      db.subscriptions.push(subscription);
    }
    
    writeLocalDb(db);
    return [subscription];
  }
}

export async function checkSubscription(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  
  if (hasRealSupabase && supabase) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("email", normalizedEmail)
      .maybeSingle();
      
    if (error) {
      console.error("Ошибка при проверке подписки в Supabase:", error);
      return false;
    }
    return data?.status === "active";
  } else {
    const db = readLocalDb();
    const sub = db.subscriptions.find(s => s.email === normalizedEmail);
    return sub?.status === "active";
  }
}

export async function getFactories() {
  if (hasRealSupabase && supabase) {
    const { data, error } = await supabase
      .from("factories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data;
  } else {
    // Если есть локально импортированный файл фабрик, читаем его
    if (fs.existsSync(LOCAL_FACTORIES_PATH)) {
      try {
        const localData = fs.readFileSync(LOCAL_FACTORIES_PATH, "utf-8");
        return JSON.parse(localData);
      } catch (e) {
        console.error("Ошибка чтения local_factories.json:", e);
      }
    }
    return MOCK_FACTORIES;
  }
}
