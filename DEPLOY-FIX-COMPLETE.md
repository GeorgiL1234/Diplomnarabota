# Деплой – стъпка по стъпка (като локално)

Локално всичко работи. За production трябва да са наред и двата deploy-а.

---

## 1. Render (Backend) – webshop-e6dx.onrender.com

### Проверка дали backend-ът работи
1. **https://webshop-e6dx.onrender.com/items/health-check** → трябва `OK` (използвай това вместо /items/ping)
2. **https://webshop-e6dx.onrender.com/status** или **/items/version** → версия  
Ако /items/ping дава 400 (MethodArgumentTypeMismatch "ping") → Spring съвпада с /{id}. Използвай /items/health-check.

### Ако backend-ът не е свързан с GitHub
1. Render Dashboard → **Dashboard** → твоето backend приложение
2. **Manual Deploy** → **Deploy latest commit**
3. Изчакай 3–5 мин (Java build е бавен)

### Render – Build & Deploy (ВАЖНО)
Сервисът „WebShop“ трябва да е **Web Service** (не Static Site). Провери:

1. **Settings** → **Build & Deploy** → скрол надолу
2. **Root Directory**: остави **празно** (корен на repo)
3. **Build Command**: `cd backend/web-shop && ./mvnw clean package -DskipTests`
4. **Start Command**: `cd backend/web-shop && java -jar target/web-shop-0.0.1-SNAPSHOT.jar`
5. **Environment** → добави: `SPRING_PROFILES_ACTIVE` = `production`
6. **Save Changes** → **Manual Deploy** → **Deploy latest commit**
7. Изчакай 5–7 мин и провери **Logs** за грешки

Ако Root Directory е `backend/web-shop`, използвай:
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/web-shop-0.0.1-SNAPSHOT.jar`

**Ако използваш Docker** (като в твоя случай):
- **Dockerfile Path**: `backend/web-shop/Dockerfile` ✓
- **Docker Build Context Directory**: трябва да е `backend/web-shop` (не `.`)
  - С `.` build-ът търси `mvnw` в корена и не го намира → грешка или стари артефакти
  - С `backend/web-shop` контекстът е правилният и build-ът минава

---

## 2. Vercel (Frontend) – webshop-app-2026.vercel.app

### Environment Variable (опционално)
Приложение има runtime проверка – на vercel.app винаги използва Render backend. За да зададеш ръчно:
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
| Снимките не се виждат | Backend не е обновен или cold start | Manual Deploy на Render, изчакай 1 мин за cold start |
| „Моите обяви“ празно | ownerEmail не съвпада | Провери дали си логнат с email |
| 500 при зареждане | Cold start на Render | Изчакай 1–2 мин, опитай отново |
| Стара версия (v2) | Cache | Clear cache and redeploy на Vercel |
