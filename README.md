# Web Shop Application

Пълнофункционално уеб приложение за онлайн магазин, изградено с Spring Boot (Backend) и React + TypeScript (Frontend).

## 📋 Съдържание

- [Технологии](#технологии)
- [Изисквания](#изисквания)
- [Инсталация](#инсталация)
- [Стартиране на приложението](#стартиране-на-приложението)
- [Деплой на приложението](#деплой-на-приложението)
- [Използване](#използване)
- [Структура на проекта](#структура-на-проекта)

## 🛠 Технологии

### Backend
- **Java 17+**
- **Spring Boot** - Framework за Java приложения
- **Spring Security** - Автентикация и авторизация
- **JWT (JSON Web Tokens)** - За сигурност
- **PostgreSQL** - Релационна база данни
- **Maven** - Dependency management

### Frontend
- **React 18** - JavaScript библиотека за UI
- **TypeScript** - Типизиран JavaScript
- **Vite** - Build tool и dev server
- **CSS3** - Стилизация с градиенти и модерен дизайн

## 📦 Изисквания

Преди да стартирате приложението, уверете се, че имате инсталирани:

- **Java JDK 17 или по-нова версия**
- **Node.js 18+ и npm** (или yarn)
- **Maven 3.6+** (или използвайте Maven Wrapper, който е включен)
- **PostgreSQL 16+** (или Docker Compose с готовата PostgreSQL услуга)

### Проверка на версиите

```bash
# Проверка на Java версията
java -version

# Проверка на Node.js версията
node -version

# Проверка на npm версията
npm -version

# Проверка на Maven версията (ако е инсталиран глобално)
mvn -version
```

## 🚀 Инсталация

### 1. Клониране на репозиторията

```bash
git clone https://github.com/GeorgiL1234/Diplomnarabota.git
cd Diplomnarabota
```

### 2. Инсталация на Backend зависимости

Backend използва Maven Wrapper, така че не е необходимо да имате Maven инсталиран глобално.

```bash
cd backend/web-shop
```

Maven автоматично ще изтегли всички зависимости при първото стартиране.

### 3. Инсталация на Frontend зависимости

```bash
cd web-shop-frontend
npm install
```

## ▶️ Стартиране на приложението

Приложението се състои от два компонента, които трябва да работят едновременно:
1. **Backend сървър** (Spring Boot) - на порт 8080
2. **Frontend сървър** (Vite dev server) - на порт 5173

### Стартиране на Backend

Отворете терминал и навигирайте до backend директорията:

```bash
cd backend/web-shop
```

#### Windows:
```bash
.\mvnw.cmd spring-boot:run
```

#### Linux/Mac:
```bash
./mvnw spring-boot:run
```

Backend сървърът ще стартира на: `http://localhost:8080`

### Стартиране на Frontend

Отворете **нов терминал** (оставете backend да работи) и навигирайте до frontend директорията:

```bash
cd web-shop-frontend
npm run dev
```

Frontend сървърът ще стартира на: `http://localhost:5173`

### Алтернативен начин (два терминала)

**Терминал 1 - Backend:**
```bash
cd backend/web-shop
.\mvnw.cmd spring-boot:run
```

**Терминал 2 - Frontend:**
```bash
cd web-shop-frontend
npm run dev
```

## 🌐 Деплой на приложението

**Важно:** Приложението трябва да бъде деплойнато на hosting платформа, а не да работи само на localhost.

### Бърз старт

За пълни инструкции вижте **[DEPLOYMENT.md](DEPLOYMENT.md)** файла.

### Препоръчани платформи

**Backend:**
- **Render.com** (безплатно) - Препоръчано за начинаещи
- **Railway.app** (безплатно с ограничения)
- **Heroku** (платено, но стабилно)

**Frontend:**
- **Vercel** (безплатно) - Препоръчано
- **Netlify** (безплатно)

### Стъпки за деплой

1. **Деплой на Backend:**
   - Избери платформа (Render, Railway, или Heroku)
   - Свържи GitHub репозиторията
   - Конфигурирай build и start команди
   - Запиши URL-а на backend-а

2. **Деплой на Frontend:**
   - Избери платформа (Vercel или Netlify)
   - Свържи GitHub репозиторията
   - Задай environment variable: `VITE_API_BASE_URL=https://your-backend-url.com`
   - Deploy

3. **Проверка:**
   - Тествай всички функционалности
   - Провери комуникацията между frontend и backend

### Конфигурационни файлове

Проектът включва готови конфигурационни файлове:
- `Procfile` - за Heroku/Railway
- `render.yaml` - за Render.com
- `vercel.json` - за Vercel
- `netlify.toml` - за Netlify
- `application-production.properties` - production настройки за backend

**За подробни инструкции вижте [DEPLOYMENT.md](DEPLOYMENT.md)**

### ⚠️ Render.com Free Tier – бавна регистрация/вход

При Render.com **безплатен план** сървърът спира след 15 мин неактивност. Първата заявка може да отнеме **50–60 секунди** (cold start).

**Решение (безплатно):** Настрой [UptimeRobot](https://uptimerobot.com) да прави HTTP заявка към:
```
https://webshop-e6dx.onrender.com/items/ping
```
на всеки 10 минути. Така сървърът остава активен и регистрацията/входът са бързи.

**Алтернатива:** При отваряне на страницата за вход/регистрация приложението автоматично изпраща заявка за „подгряване“ – изчакай 30–60 сек преди да натиснеш „Регистрирай“.

## 💻 Използване

1. Отворете браузъра и навигирайте до: `http://localhost:5173`
2. Регистрирайте нов акаунт или влезте с съществуващ
3. Създайте обяви за продажба
4. Разгледайте обявите от други потребители
5. Добавете обяви към любими
6. Направете поръчки
7. Използвайте VIP функцията за да поставите обявата си на първо място

### Първоначални данни

При първото стартиране, приложението автоматично създава примерни данни:
- Потребители с различни обяви
- Категории: Електроника, Книги, Дрехи, Спорт, Дом и градина, Автомобили, Други

## 📁 Структура на проекта

```
Diplomnarabota/
├── backend/
│   └── web-shop/              # Spring Boot приложение
│       ├── src/
│       │   └── main/
│       │       └── java/
│       │           └── com/example/webshop/
│       │               ├── config/          # Конфигурации (Security, JWT, CORS)
│       │               ├── controllers/     # REST контролери
│       │               ├── models/          # Entity модели
│       │               ├── repositories/   # Data access layer
│       │               ├── services/        # Business logic
│       │               └── dto/            # Data Transfer Objects
│       ├── pom.xml                          # Maven зависимости
│       └── mvnw / mvnw.cmd                 # Maven Wrapper
│
└── web-shop-frontend/         # React приложение
    ├── src/
    │   ├── App.tsx            # Главен компонент
    │   ├── App.css            # Стилове
    │   ├── main.tsx           # Entry point
    │   └── translations.ts    # Многоезична поддръжка (BG, EN, RU)
    ├── package.json           # npm зависимости
    └── vite.config.ts         # Vite конфигурация
```

## 🔧 Конфигурация

### Backend конфигурация

Файл: `backend/web-shop/src/main/resources/application.properties`

Основни настройки:
- **Порт:** 8080
- **База данни:** PostgreSQL (`webshop` по подразбиране)
- **JWT Secret:** Конфигуриран в `SecurityConfig.java`

### Frontend конфигурация

Файл: `web-shop-frontend/src/config.ts`

- **Порт:** 5173 (development)
- **API Base URL:** Конфигурира се чрез environment variable `VITE_API_BASE_URL`
- **За localhost:** По подразбиране използва `http://localhost:8080`
- **За production:** Задай `VITE_API_BASE_URL` в hosting платформата

## 🗄️ База данни

Приложението използва **PostgreSQL**. Таблиците се създават/обновяват автоматично чрез Hibernate `ddl-auto=update`.

По подразбиране backend-ът се свързва към: `jdbc:postgresql://localhost:5432/webshop`.

Локалните настройки могат да се променят чрез `SPRING_DATASOURCE_*` или `DB_*` environment variables.

## 🌐 API Endpoints

### Автентикация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Обяви
- `GET /api/items` - Всички обяви
- `GET /api/items/{id}` - Детайли за обява
- `POST /api/items` - Създаване на обява
- `GET /api/items/my` - Моите обяви

### Любими
- `GET /api/favorites/{email}` - Любими обяви
- `POST /api/favorites` - Добавяне към любими
- `DELETE /api/favorites/{email}/{itemId}` - Премахване от любими

### VIP
- `POST /api/vip/activate/{itemId}` - Активиране на VIP (2 BGN)

### Поръчки
- `POST /api/item-orders` - Създаване на поръчка
- `GET /api/item-orders/customer/{email}` - Моите поръчки
- `GET /api/item-orders/seller/{email}` - Поръчки към моите обяви

### Съобщения
- `POST /api/items/messages` - Изпращане на съобщение
- `GET /api/items/messages/sent/{email}` - Изпратени съобщения
- `GET /api/items/messages/received/{email}` - Получени съобщения

## 🐛 Отстраняване на проблеми

### Backend не стартира
- Проверете дали Java 17+ е инсталиран: `java -version`
- Проверете дали порт 8080 е свободен
- Изтрийте `target/` директорията и опитайте отново

### Frontend не стартира
- Проверете дали Node.js е инсталиран: `node -version`
- Изтрийте `node_modules/` и `package-lock.json`, след това: `npm install`
- Проверете дали порт 5173 е свободен

### Грешка при комуникация между Frontend и Backend
- Уверете се, че и двата сървъра работят
- Проверете CORS настройките в `WebConfig.java`
- Проверете дали API_BASE URL в `App.tsx` е правилен

### Бял екран в браузъра
- Отворете конзолата на браузъра (F12) и проверете за грешки
- Уверете се, че backend сървърът работи
- Проверете дали има проблеми с CORS

## 📝 Лиценз

Този проект е част от дипломна работа.

## 👤 Автор

Georgi Lazarov

## 🔗 Връзки

- GitHub: https://github.com/GeorgiL1234/Diplomnarabota

---

**Забележка:** Това приложение е създадено за образователни цели като част от дипломна работа.
