# 🚀 Инструкции за деплой на Web Shop приложението

Това ръководство обяснява как да деплойнеш приложението на различни платформи.

## 📋 Съдържание

- [Общи изисквания](#общи-изисквания)
- [Деплой на Backend](#деплой-на-backend)
  - [Render.com](#rendercom)
  - [Railway.app](#railwayapp)
  - [Heroku](#heroku)
- [Деплой на Frontend](#деплой-на-frontend)
  - [Vercel](#vercel)
  - [Netlify](#netlify)
- [Конфигурация на Environment Variables](#конфигурация-на-environment-variables)
- [Проверка след деплой](#проверка-след-деплой)

---

## Общи изисквания

Преди да започнеш деплоя:

1. **GitHub репозиторий** - Проектът трябва да е качен в GitHub
2. **Акаунти** - Регистрирай се в избраните платформи
3. **Backend URL** - Запиши URL-а на деплойнатия backend (ще го използваш за frontend)

---

## Деплой на Backend

### Render.com

1. **Влез в Render Dashboard:**
   - Отиди на https://render.com
   - Регистрирай се или влез

2. **Създай нов Web Service:**
   - Кликни на "New +" → "Web Service"
   - Свържи GitHub репозиторията

3. **Конфигурация:**
   - **Name:** `webshop-backend`
   - **Environment:** `Java`
   - **Build Command:** `cd backend/web-shop && ./mvnw clean package -DskipTests`
   - **Start Command:** `cd backend/web-shop && java -jar target/web-shop-0.0.1-SNAPSHOT.jar`
   - **Java Version:** `17`

4. **Environment Variables:**
   ```
   SPRING_PROFILES_ACTIVE=production
   PORT=8080
   ```

5. **Disk (за база данни):**
   - Добави Persistent Disk
   - **Mount Path:** `/opt/render/project/src/backend/web-shop/data`
   - **Size:** 1GB

6. **Deploy:**
   - Кликни "Create Web Service"
   - Изчакай деплоя да завърши
   - Запиши URL-а (пример: `https://webshop-backend.onrender.com`)

---

### Railway.app

1. **Влез в Railway:**
   - Отиди на https://railway.app
   - Регистрирай се с GitHub

2. **Създай нов проект:**
   - Кликни "New Project"
   - Избери "Deploy from GitHub repo"
   - Избери репозиторията

3. **Конфигурация:**
   - Railway автоматично ще разпознае Java проекта
   - **Root Directory:** `backend/web-shop`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/web-shop-0.0.1-SNAPSHOT.jar`

4. **Environment Variables:**
   ```
   SPRING_PROFILES_ACTIVE=production
   ```

5. **Volume (за база данни):**
   - Добави Volume
   - **Mount Path:** `/app/data`
   - Обнови `application-production.properties` да използва `/app/data`

6. **Deploy:**
   - Railway автоматично ще деплойне
   - Запиши URL-а

---

### Heroku

1. **Инсталирай Heroku CLI:**
   ```bash
   # Windows (с Chocolatey)
   choco install heroku-cli
   
   # Или изтегли от https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Влез в Heroku:**
   ```bash
   heroku login
   ```

3. **Създай приложение:**
   ```bash
   cd backend/web-shop
   heroku create webshop-backend
   ```

4. **Настрой Java buildpack:**
   ```bash
   heroku buildpacks:set heroku/java
   ```

5. **Environment Variables:**
   ```bash
   heroku config:set SPRING_PROFILES_ACTIVE=production
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

7. **Запиши URL-а:**
   ```bash
   heroku info
   ```

---

## Деплой на Frontend

### Vercel

1. **Влез в Vercel:**
   - Отиди на https://vercel.com
   - Регистрирай се с GitHub

2. **Импортирай проект:**
   - Кликни "Add New Project"
   - Избери GitHub репозиторията
   - **Root Directory:** `web-shop-frontend`

3. **Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
   Замени `https://your-backend-url.com` с реалния URL на твоя backend!

5. **Deploy:**
   - Кликни "Deploy"
   - Изчакай деплоя да завърши
   - Запиши URL-а на frontend-а

---

### Netlify

1. **Влез в Netlify:**
   - Отиди на https://netlify.com
   - Регистрирай се с GitHub

2. **Импортирай проект:**
   - Кликни "Add new site" → "Import an existing project"
   - Избери GitHub репозиторията

3. **Build Settings:**
   - **Base directory:** `web-shop-frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `web-shop-frontend/dist`

4. **Environment Variables:**
   - Отиди в "Site settings" → "Environment variables"
   - Добави:
     ```
     VITE_API_BASE_URL=https://your-backend-url.com
     ```
   Замени с реалния URL на твоя backend!

5. **Deploy:**
   - Кликни "Deploy site"
   - Изчакай деплоя да завърши

---

## Конфигурация на Environment Variables

### Backend Environment Variables

```
SPRING_PROFILES_ACTIVE=production
PORT=8080  (автоматично задава се от платформата)
```

### Frontend Environment Variables

```
VITE_API_BASE_URL=https://your-backend-url.com
```

**Важно:** Замени `https://your-backend-url.com` с реалния URL на твоя деплойнат backend!

---

## Проверка след деплой

### 1. Проверка на Backend

Отвори в браузъра:
```
https://your-backend-url.com/api/items
```

Трябва да видиш JSON с обявите.

### 2. Проверка на Frontend

Отвори в браузъра:
```
https://your-frontend-url.com
```

Трябва да видиш приложението.

### 3. Проверка на комуникацията

1. Отвори конзолата на браузъра (F12)
2. Отиди в "Network" таб
3. Опитай да заредиш обявите
4. Провери дали заявките отиват към правилния backend URL

---

## Често срещани проблеми

### Backend не стартира

- Провери дали Java 17 е наличен
- Провери логите в платформата
- Уверете се, че `Procfile` е правилен

### Frontend не може да се свърже с Backend

- Провери дали `VITE_API_BASE_URL` е правилно зададен
- Провери CORS настройките в backend
- Уверете се, че backend URL-ът е достъпен

### База данни се нулира при рестарт

- За Render: Уверете се, че Persistent Disk е конфигуриран правилно
- За Railway: Уверете се, че Volume е монтиран
- За Heroku: Heroku не поддържа персистентно съхранение - използвай PostgreSQL

---

## Следващи стъпки

1. **Тествай всички функционалности:**
   - Регистрация/Вход
   - Създаване на обяви
   - Добавяне към любими
   - Поръчки
   - VIP функция

2. **Мониторинг:**
   - Проверявай логите редовно
   - Следи за грешки

3. **Backup:**
   - Регулярно прав backup на базата данни (ако е възможно)

---

## Полезни връзки

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

**Успешен деплой! 🎉**
