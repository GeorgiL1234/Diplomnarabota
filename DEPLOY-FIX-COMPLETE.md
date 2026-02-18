# Деплой – стъпка по стъпка (като локално)

Локално всичко работи. За production трябва да са наред и двата deploy-а.

---

## 1. Render (Backend) – webshop-e6dx.onrender.com

### Проверка дали backend-ът работи
1. **https://webshop-e6dx.onrender.com/items/ping** → трябва `OK` (backend-ът е жив)
2. **https://webshop-e6dx.onrender.com/items/version** → трябва `{"build":"v3-feb2026"}` (backend-ът е обновен)  
Ако `/items/version` дава 404 → backend-ът не е deploy-нат с последния код. Manual Deploy на Render.

### Ако backend-ът не е свързан с GitHub
1. Render Dashboard → **Dashboard** → твоето backend приложение
2. **Manual Deploy** → **Deploy latest commit**
3. Изчакай 3–5 мин (Java build е бавен)

### Ако backend-ът Е свързан с GitHub
1. Settings → **Build & Deploy**
2. **Branch**: `main`
3. **Root Directory**: празно (корен на repo)
4. **Build Command**: `cd backend/web-shop && ./mvnw clean package -DskipTests`
5. **Start Command**: `cd backend/web-shop && java -jar target/web-shop-0.0.1-SNAPSHOT.jar`
6. Ако няма нов deploy след push → **Manual Deploy**

---

## 2. Vercel (Frontend) – webshop-app-2026.vercel.app

### Environment Variable (задължително)
1. Vercel Dashboard → твоят проект → **Settings** → **Environment Variables**
2. Добави: `VITE_API_BASE_URL` = `https://webshop-e6dx.onrender.com`
3. Scope: **Production**, **Preview**
4. **Save**
5. След промяна на env → **Redeploy** (Deployments → ⋯ → Redeploy)

### Build настройки
1. **Settings** → **General**
2. **Root Directory**: празно
3. **Build Command**: `cd web-shop-frontend && npm run build`
4. **Output Directory**: `web-shop-frontend/dist`

### Redeploy
Deployments → последният deploy → ⋯ → **Redeploy** → включи **Clear cache and redeploy**

---

## 3. Проверка

1. **Backend**: https://webshop-e6dx.onrender.com/items/ping → `OK`
2. **Frontend**: https://webshop-app-2026.vercel.app → виждаш v3
3. **F12 → Network**: заявките към `webshop-e6dx.onrender.com` връщат 200
4. Hard refresh: **Ctrl+Shift+R**

---

## Често срещани грешки

| Проблем | Причина | Решение |
|--------|---------|---------|
| Снимките не се виждат | Backend не е обновен | Manual Deploy на Render |
| „Моите обяви“ празно | ownerEmail не съвпада | Провери дали си логнат с email |
| 500 при зареждане | Cold start на Render | Изчакай 1–2 мин, опитай отново |
| Стара версия (v2) | Cache | Clear cache and redeploy на Vercel |
