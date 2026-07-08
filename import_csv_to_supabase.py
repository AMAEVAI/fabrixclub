import csv
import json
import os
import re

CSV_FILENAME = "333.xlsx - 333.csv"
LOCAL_FACTORIES_PATH = "local_factories.json"

COUNTRY_FLAGS = {
    "турция": "🇹🇷",
    "франция": "🇫🇷",
    "италия": "🇮🇹",
    "китай": "🇨🇳",
    "португалия": "🇵🇹",
    "испания": "🇪🇸",
    "германия": "🇩🇪",
    "индия": "🇮🇳",
    "вьетнам": "🇻🇳"
}

def clean_moq_category(moq_str):
    # Пытаемся определить категорию MOQ
    moq_lower = str(moq_str).lower()
    try:
        # Ищем числа в строке
        nums = [int(s) for s in re.findall(r'\d+', moq_lower)]
        if not nums:
            return "medium"
        val = nums[0]
        if val < 100:
            return "low"
        elif val >= 500:
            return "high"
        else:
            return "medium"
    except:
        return "medium"

def main():
    # Ищем файлы в текущей директории
    csv_file = None
    for f in os.listdir('.'):
        if f.endswith('.csv') and ('333' in f or '444' in f):
            csv_file = f
            break

    if not csv_file:
        # Проверяем дефолтное название
        if os.path.exists(CSV_FILENAME):
            csv_file = CSV_FILENAME
        else:
            print("❌ Ошибка: Не найден файл CSV (например, '333.xlsx - 333.csv').")
            print("Пожалуйста, поместите ваш CSV-файл с таблицей фабрик в корень папки проекта.")
            return

    print(f"📦 Найдена таблица для импорта: {csv_file}")
    
    factories = []
    
    with open(csv_file, mode='r', encoding='utf-8') as f:
        # Пробуем определить разделитель (запятая или точка с запятой)
        sample = f.read(2048)
        f.seek(0)
        dialect = csv.Sniffer().sniff(sample)
        reader = csv.DictReader(f, dialect=dialect)
        
        # Проверяем имена колонок
        fieldnames = reader.fieldnames
        print("Колонки в файле:", fieldnames)
        
        # Маппинг колонок (русские названия)
        col_name = next((c for c in fieldnames if 'название' in c.lower() or 'name' in c.lower()), None)
        col_category = next((c for c in fieldnames if 'категория' in c.lower() or 'category' in c.lower()), None)
        col_brands = next((c for c in fieldnames if 'бренд' in c.lower() or 'brand' in c.lower()), None)
        col_niche = next((c for c in fieldnames if 'ниша' in c.lower() or 'стиль' in c.lower() or 'niche' in c.lower()), None)
        col_moq = next((c for c in fieldnames if 'минимальный' in c.lower() or 'moq' in c.lower() or 'закуп' in c.lower()), None)
        col_country = next((c for c in fieldnames if 'страна' in c.lower() or 'pays' in c.lower() or 'country' in c.lower()), None)
        col_contacts = next((c for c in fieldnames if 'контакт' in c.lower() or 'contact' in c.lower()), None)
        col_site = next((c for c in fieldnames if 'сайт' in c.lower() or 'web' in c.lower() or 'site' in c.lower()), None)
        col_rating = next((c for c in fieldnames if 'опыт' in c.lower() or 'рейтинг' in c.lower() or 'rating' in c.lower()), None)

        if not col_name or not col_country:
            print("❌ Ошибка: В CSV файле должны быть как минимум колонки для Названия и Страны.")
            return

        for idx, row in enumerate(reader, start=1):
            name = row.get(col_name, f"Factory #{idx}").strip()
            if not name:
                continue # Пропускаем пустые строки
                
            country = row.get(col_country, "Турция").strip()
            flag = COUNTRY_FLAGS.get(country.lower(), "🌐")
            
            category = row.get(col_category, "Одежда").strip() if col_category else "Одежда"
            brands = row.get(col_brands, "N/A").strip() if col_brands else "N/A"
            niche = row.get(col_niche, "Масс-маркет").strip() if col_niche else "Масс-маркет"
            moq = row.get(col_moq, "100").strip() if col_moq else "100"
            moq_cat = clean_moq_category(moq)
            
            contacts_str = row.get(col_contacts, "N/A").strip() if col_contacts else "N/A"
            # Пробуем выделить email и телефон из контактов
            email = "info@factory.com"
            phone = "N/A"
            
            emails_found = re.findall(r'[\w\.-]+@[\w\.-]+', contacts_str)
            if emails_found:
                email = emails_found[0]
            
            phones_found = re.findall(r'\+?\d[\d\s\-\(\)]{8,14}\d', contacts_str)
            if phones_found:
                phone = phones_found[0]
            
            site = row.get(col_site, "N/A").strip() if col_site else "N/A"
            if site != "N/A" and not site.startswith("http"):
                site = "https://" + site
                
            # Пытаемся спарсить рейтинг / опыт
            rating = 4.5
            if col_rating:
                try:
                    rating_val = float(row.get(col_rating, 4.5))
                    if rating_val > 5.0:
                        rating = 4.5 + (rating_val % 0.5)
                    else:
                        rating = rating_val
                except:
                    pass
            
            factory = {
                "id": idx,
                "name": name,
                "country": country,
                "flag": flag,
                "category": category,
                "brands": brands,
                "niche": niche,
                "MOQ": moq,
                "moqCategory": moq_cat,
                "contact": email,
                "phone": phone,
                "site": site,
                "rating": round(rating, 1)
            }
            factories.append(factory)

    # Сохраняем в локальный JSON
    with open(LOCAL_FACTORIES_PATH, "w", encoding="utf-8") as f:
        json.dump(factories, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Успешно импортировано {len(factories)} фабрик в {LOCAL_FACTORIES_PATH}!")
    print("Кабинет автоматически подгрузит эти данные при локальном тестировании.")

    # Пробуем загрузить в Supabase, если ключи настроены
    env_path = ".env.local"
    supabase_url = None
    supabase_key = None
    
    if os.path.exists(env_path):
        with open(env_path, "r") as ef:
            lines = ef.read().splitlines()
            for l in lines:
                if l.startswith("NEXT_PUBLIC_SUPABASE_URL="):
                    supabase_url = l.split("=")[1].strip()
                if l.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
                    supabase_key = l.split("=")[1].strip()

    if supabase_url and supabase_key and "your-project" not in supabase_url and "your-anon-key" not in supabase_key:
        print("🔗 Обнаружены ключи Supabase! Пробуем выполнить загрузку в облачную БД...")
        try:
            from supabase import create_client
            sp = create_client(supabase_url, supabase_key)
            
            # Загружаем строки пачками по 50
            for i in range(0, len(factories), 50):
                chunk = factories[i:i+50]
                # Преобразуем формат под Supabase (убираем id, чтобы сработал автоинкремент UUID)
                sp_chunk = []
                for f in chunk:
                    sp_f = {
                        "name": f["name"],
                        "country": f["country"],
                        "flag": f["flag"],
                        "category": f["category"],
                        "brands": f["brands"],
                        "niche": f["niche"],
                        "moq": f["MOQ"],
                        "moq_category": f["moqCategory"],
                        "contact_email": f["contact"],
                        "phone": f["phone"],
                        "website": f["site"],
                        "rating": f["rating"]
                    }
                    sp_chunk.append(sp_f)
                
                sp.table("factories").insert(sp_chunk).execute()
            print("🚀 Успешно выгружено в Supabase!")
        except Exception as e:
            print("⚠️ Ошибка автоматической выгрузки в Supabase:", e)
            print("Вы можете сделать это вручную через Supabase Dashboard, импортировав CSV-файл.")
    else:
        print("ℹ️ Ключи Supabase не настроены или содержат плейсхолдеры. Данные сохранены локально для оффлайн работы.")

if __name__ == "__main__":
    main()
