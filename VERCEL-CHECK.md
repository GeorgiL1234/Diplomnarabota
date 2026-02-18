# Проверка на Vercel deploy

## Ако не виждаш промени след push

### 1. Провери версията в приложението
- Отвори https://webshop-app-2026.vercel.app
- В заглавието до "Web Shop" трябва да виждаш **v3** (не v2)
- Ако виждаш v2 → deploy-ът не е обновен

### 2. Vercel Dashboard – настройки
1. Отиди на https://vercel.com/dashboard
2. Избери проекта (webshop-app-2026)
3. **Settings → Git**
   - **Connected Git Repository** – трябва да е `GeorgiL1234/Diplomnarabota` (или твоето repo)
   - **Production Branch** – трябва да е `main`
4. **Settings → General**
   - **Root Directory** – трябва да е празно или `.` (корен на repo)
   - Ако е `web-shop-frontend`, vercel.json може да се игнорира

### 3. Ръчен redeploy с изчистване на cache
1. Vercel Dashboard → твоят проект
2. **Deployments** → последният deploy
3. Три точки (⋯) → **Redeploy**
4. Включи **Clear build cache and redeploy**
5. Натисни **Redeploy**
6. Изчакай 1–2 минути
7. Hard refresh (Ctrl+Shift+R) на сайта

### 4. Провери дали deploy-ът е успешен
- В Deployments трябва да има зелен статус **Ready**
- Ако е **Failed** – отвори логовете и виж грешката
- **Building** – изчакай да приключи

### 5. Browser cache
- Ctrl+Shift+R (hard refresh)
- Или отвори в Incognito/Private window
- Или F12 → Application → Clear storage → Clear site data
