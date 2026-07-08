import subprocess
import webbrowser
import threading
import time
import os
import sys

PORT = 3000

def check_npm_installed():
    try:
        subprocess.run(["npm", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except FileNotFoundError:
        return False

def open_browser():
    time.sleep(3.5) # Даем серверу Next.js время на запуск
    url = f"http://localhost:{PORT}"
    print(f"🌐 Открываем веб-интерфейс: {url}")
    webbrowser.open(url)

def main():
    print("🚀 Подготовка к запуску B2B Factory Hub (Next.js + Supabase)...")
    
    if not check_npm_installed():
        print("❌ Ошибка: В системе не установлен Node.js и npm. Пожалуйста, установите их перед запуском.")
        sys.exit(1)

    # Проверяем наличие node_modules, если нет — ставим
    if not os.path.exists("node_modules"):
        print("📦 Установка зависимостей проекта (это может занять немного времени)...")
        subprocess.run(["npm", "install"], check=True)
        print("✅ Зависимости успешно установлены!")

    # Запускаем открытие браузера в параллельном потоке
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()

    print(f"🔥 Запуск Next.js сервера на http://localhost:{PORT}...")
    try:
        # Запускаем dev сервер Next.js
        subprocess.run(["npm", "run", "dev", "--", "-p", str(PORT)], check=True)
    except KeyboardInterrupt:
        print("\n👋 Сервер успешно остановлен.")
        sys.exit(0)

if __name__ == "__main__":
    main()
