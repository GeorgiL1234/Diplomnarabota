# Инструкции за деплой

## Какво е направено

- **Git push** – всички промени са commit-нати и push-нати към `main`
- **Vercel** – при свързан GitHub repo ще направи автоматичен deploy

## След push

### 1. Vercel (Frontend)
- Ако проектът е свързан с `GeorgiL1234/Diplomnarabota`, deploy ще започне автоматично
- Провери в Vercel Dashboard → Deployments дали има нов deploy
- Ако няма: **Redeploy** → **Clear cache and redeploy**

### 2. Render (Backend)
- Отиди в Render Dashboard → твоето backend приложение
- Направи **Manual Deploy** (ако не е свързано с GitHub)
- Или изчакай автоматичен deploy, ако е свързано с същия repo

### 3. Environment Variables

**Vercel** (задължително за build):
- `VITE_API_BASE_URL` = `https://webshop-e6dx.onrender.com`

**Render** – ако използваш PostgreSQL или други услуги, добави съответните променливи.

## Проверка

1. Отвори https://webshop-app-2026.vercel.app
2. Ако обявите са празни – backend-ът на Render може да е в cold start (изчакай ~1 мин)
3. F12 → Network – провери дали заявките към `webshop-e6dx.onrender.com` връщат 200
