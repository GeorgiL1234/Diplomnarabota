# Как да оправиш качването на снимки (72 часа)

## Проблем
Грешката "Обявата е създадена, но снимката не беше качена" означава, че **работиш със СТАРА версия** на приложението. В новата версия снимката се изпраща директно в create request и тази грешка **не може** да се появи.

## Проверка: Имаш ли новата версия?
- **Нова версия:** Виждаш "Web Shop **v2**" в заглавието (ляво горе)
- **Стара версия:** Виждаш само "Web Shop" без v2

Ако НЕ виждаш v2 → трябва да деплойнеш.

---

## Стъпки за деплой

### 1. Push в GitHub
```bash
cd "c:\Diplomen proekt"
git add .
git status
git commit -m "Fix: image in create request, v2"
git push origin main
```
*(Ако използваш друг branch, сменяш main с твоя branch)*

### 2. Vercel (Frontend)
- Отиди на https://vercel.com/dashboard
- Намери проекта Web Shop
- Ако има "Redeploy" – натисни го
- Или изчакай автоматичния deploy след push (1–2 мин)
- Провери Deployments – последният трябва да е "Ready"

### 3. Render (Backend) – **ВАЖНО**
- Отиди на https://dashboard.render.com
- Намери webshop-e6dx (или твоя backend)
- **Manual Deploy:** Натисни "Manual Deploy" → "Deploy latest commit"
- Изчакай 3–5 мин за build
- **Проверка:** Отвори `https://webshop-e6dx.onrender.com/health/build` – трябва да виждаш `{"build":"image-in-create-v2"}`

### 4. Hard refresh в браузъра
- **Windows:** `Ctrl + Shift + R` или `Ctrl + F5`
- **Mac:** `Cmd + Shift + R`
- Или: DevTools (F12) → десен клик на Refresh → "Empty Cache and Hard Reload"

### 5. Проверка
- Отвори сайта
- Виждаш ли "Web Shop **v2**"? → Имаш новата версия
- Отвори DevTools (F12) → Console
- При създаване на обява трябва да виждаш: `CREATE-WITH-IMAGE-BASE64-v2`

---

## Ако все още не работи

### Тест локално (без деплой)
1. Стартирай backend: `cd backend/web-shop` → `mvn spring-boot:run` (или както го пускаш)
2. Стартирай frontend: `cd web-shop-frontend` → `npm run dev`
3. Отвори http://localhost:5173
4. Създай обява със снимка – трябва да работи

Ако работи локално, но не на Vercel → проблемът е в деплоя (cache, грешен branch, и т.н.).

### Проверка на Vercel
- Settings → Environment Variables: `VITE_API_BASE_URL` трябва да е `https://webshop-e6dx.onrender.com` (или твоят backend URL)
- Build Command: `cd web-shop-frontend && npm run build`
- Output Directory: `web-shop-frontend/dist`

---

## Лайв чат (съобщения)
Ако съобщенията не работят – това е отделен проблем. Провери:
- Backend да е стартиран (Render)
- Console за грешки при изпращане
- Endpoint: POST `/items/{itemId}/messages`
