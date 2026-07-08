const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const EXCEL_PATH = '333.xlsx';
const LOCAL_FACTORIES_PATH = 'local_factories.json';

const COUNTRY_MAP = {
  'turkey': { name: 'Турция', flag: '🇹🇷' },
  'turkiye': { name: 'Турция', flag: '🇹🇷' },
  'турция': { name: 'Турция', flag: '🇹🇷' },
  'portugal': { name: 'Португалия', flag: '🇵🇹' },
  'португалия': { name: 'Португалия', flag: '🇵🇹' },
  'france': { name: 'Франция', flag: '🇫🇷' },
  'франция': { name: 'Франция', flag: '🇫🇷' },
  'italy': { name: 'Италия', flag: '🇮🇹' },
  'италия': { name: 'Италия', flag: '🇮🇹' },
  'china': { name: 'Китай', flag: '🇨🇳' },
  'китай': { name: 'Китай', flag: '🇨🇳' },
  'spain': { name: 'Испания', flag: '🇪🇸' },
  'испания': { name: 'Испания', flag: '🇪🇸' },
};

function getCountryInfo(rawCountry) {
  if (!rawCountry) return { name: 'Другая', flag: '🌐' };
  const clean = rawCountry.toString().trim().toLowerCase();
  if (COUNTRY_MAP[clean]) {
    return COUNTRY_MAP[clean];
  }
  for (const [key, val] of Object.entries(COUNTRY_MAP)) {
    if (clean.includes(key)) {
      return val;
    }
  }
  return { name: rawCountry.toString().trim(), flag: '🌐' };
}

function cleanMoqCategory(moqStr) {
  if (!moqStr) return 'medium';
  const clean = moqStr.toString().toLowerCase();
  const nums = clean.match(/\d+/g);
  if (!nums || nums.length === 0) {
    if (clean.includes('na') || clean.includes('no minimum') || clean.includes('без')) {
      return 'low';
    }
    return 'medium';
  }
  const val = parseInt(nums[0], 10);
  if (val < 100) return 'low';
  if (val >= 500) return 'high';
  return 'medium';
}

function extractEmail(contactStr) {
  if (!contactStr) return 'info@factory.com';
  const emails = contactStr.toString().match(/[\w\.-]+@[\w\.-]+/g);
  return emails ? emails[0] : 'info@factory.com';
}

function extractPhone(contactStr) {
  if (!contactStr) return 'N/A';
  const phones = contactStr.toString().match(/\+?\d[\d\s\-\(\)]{8,14}\d/g);
  return phones ? phones[0] : 'N/A';
}

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`❌ Ошибка: Файл ${EXCEL_PATH} не найден.`);
    return;
  }

  console.log(`📦 Чтение Excel файла: ${EXCEL_PATH}...`);
  const workbook = XLSX.readFile(EXCEL_PATH);
  
  let factories = [];
  let globalId = 1;

  if (workbook.SheetNames.includes('333')) {
    console.log("Парсинг листа '333'...");
    const sheet333 = workbook.Sheets['333'];
    const rows = XLSX.utils.sheet_to_json(sheet333);
    
    rows.forEach((row) => {
      const name = row['Название фабрики '] || row['Название фабрики'] || row['Name'];
      if (!name) return;

      const rawCountry = row['Страна'] || row['Country'];
      const { name: country, flag } = getCountryInfo(rawCountry);

      const category = row['Kатегория'] || row['Категория'] || 'Одежда';
      const brands = row['Бренды с кем работают  '] || row['Бренды с кем работают'] || 'N/A';
      const niche = row['Ниша, Стиль '] || row['Ниша, Стиль'] || 'Casual / Fashion';
      const moq = row['Минимальный закуп'] || '100';
      const moqCategory = cleanMoqCategory(moq);
      const contactStr = row['Контакты'] || '';
      const email = extractEmail(contactStr);
      const phone = extractPhone(contactStr);
      
      let site = row['Сайт '] || row['Сайт'] || 'N/A';
      site = site.toString().trim();
      if (site !== 'N/A' && !site.startsWith('http')) {
        site = 'https://' + site;
      }

      let rating = 4.5;
      const rawExp = row['Опыт работы'] || row['Рейтинг'];
      if (rawExp) {
        const exp = parseFloat(rawExp);
        if (!isNaN(exp)) {
          if (exp > 5) {
            rating = 4.5 + ((exp % 5) / 10);
            if (rating > 5.0) rating = 4.9;
          } else {
            rating = exp;
          }
        }
      }

      factories.push({
        id: globalId++,
        name: name.toString().trim(),
        country,
        flag,
        category: category.toString().trim(),
        brands: brands.toString().trim(),
        niche: niche.toString().trim(),
        MOQ: moq.toString().trim(),
        moqCategory,
        contact: email,
        phone,
        site,
        rating: parseFloat(rating.toFixed(1))
      });
    });
  }

  if (workbook.SheetNames.includes('444')) {
    console.log("Парсинг листа '444'...");
    const sheet444 = workbook.Sheets['444'];
    const rows = XLSX.utils.sheet_to_json(sheet444);
    
    rows.forEach((row) => {
      const name = row['Fournisseur'] || row['Name'];
      if (!name) return;

      const rawCountry = row['Pays'] || row['Country'];
      const { name: country, flag } = getCountryInfo(rawCountry);

      const category = row['Catégorie'] || 'Обувь / Одежда';
      const brands = row['Clients'] || 'N/A';
      const niche = row['Labels'] || 'Standard Quality';
      const moq = row['QMC'] || '100';
      const moqCategory = cleanMoqCategory(moq);
      const contactStr = row['Contact'] || '';
      const email = extractEmail(contactStr);
      const phone = extractPhone(contactStr);
      
      let site = row['Site web'] || row['Website'] || 'N/A';
      site = site.toString().trim();
      if (site !== 'N/A' && !site.startsWith('http')) {
        site = 'https://' + site;
      }

      factories.push({
        id: globalId++,
        name: name.toString().trim(),
        country,
        flag,
        category: category.toString().trim(),
        brands: brands.toString().trim(),
        niche: niche.toString().trim(),
        MOQ: moq.toString().trim(),
        moqCategory,
        contact: email,
        phone,
        site,
        rating: 4.6
      });
    });
  }

  fs.writeFileSync(LOCAL_FACTORIES_PATH, JSON.stringify(factories, null, 2), 'utf-8');
  console.log(`\n✅ Успешно импортировано ${factories.length} фабрик в ${LOCAL_FACTORIES_PATH}!`);

  const envPath = '.env.local';
  let supabaseUrl = '';
  let supabaseKey = '';

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    lines.forEach(l => {
      if (l.trim().startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = l.split('=')[1].trim();
      }
      if (l.trim().startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = l.split('=')[1].trim();
      }
    });
  }

  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseKey.includes('your-anon-key')) {
    console.log("🔗 Найдена конфигурация Supabase. Выгружаем данные в базу данных...");
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      console.log("Очищаем таблицу 'factories' в Supabase...");
      
      const spRows = factories.map(f => ({
        name: f.name,
        country: f.country,
        flag: f.flag,
        category: f.category,
        brands: f.brands,
        niche: f.niche,
        moq: f.MOQ,
        moq_category: f.moqCategory,
        contact_email: f.contact,
        phone: f.phone,
        website: f.site,
        rating: f.rating
      }));

      // Удалим все предыдущие записи
      const deleteRes = await supabase.from('factories').delete().neq('name', '');
      if (deleteRes.error) {
        throw new Error(`Ошибка удаления записей: ${deleteRes.error.message} (${deleteRes.error.details || ''})`);
      }

      // Запишем новые
      for (let i = 0; i < spRows.length; i += 100) {
        const chunk = spRows.slice(i, i + 100);
        const { error } = await supabase.from('factories').insert(chunk);
        if (error) {
          throw new Error(`Ошибка вставки пакета ${i}: ${error.message} (${error.details || ''})`);
        }
      }
      console.log("🚀 Данные успешно выгружены в облако Supabase!");
    } catch (e) {
      console.error("❌ Ошибка при работе с Supabase:", e.message);
      console.log("Подсказка: проверьте, что в Supabase создана таблица 'factories' и отключена RLS (или настроена политика на вставку для Anon-пользователей).");
    }
  } else {
    console.log("ℹ️ Облачный Supabase не подключен (используется локальная БД). Все готово для локального запуска!");
  }
}

main();
