# BookShop — Інтернет-магазин книг

Веб-застосунок для продажу книг: каталог, кошик, замовлення, адмін-панель.

**Технології:** FastAPI + PostgreSQL + React + TypeScript + Tailwind CSS

## Вимоги

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 15+

## Встановлення та запуск

### 1. Клонування репозиторію

```bash
git clone https://github.com/<your-username>/book-shop.git
cd book-shop
```

### 2. База даних

Переконайтесь, що PostgreSQL запущений. Створіть базу даних та заповніть її:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE book_shop ENCODING 'UTF8';"
psql -h localhost -U postgres -d book_shop -f book_shop.sql
psql -h localhost -U postgres -d book_shop -f seed.sql
psql -h localhost -U postgres -d book_shop -f seed_books.sql
```

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
```

Створіть файл `.env` на основі шаблону:

```bash
cp .env.example .env
```

Відредагуйте `.env` — вкажіть свій пароль від PostgreSQL:

```
DB_PASSWORD=ваш_пароль
```

Запуск сервера:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend буде доступний на `http://localhost:8000`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend буде доступний на `http://localhost:3001`

### 5. Тестовий вхід

- **Адмін:** логін `admin`, пароль `admin123`
- Нові користувачі можуть зареєструватись через форму реєстрації

## Структура проекту

```
book-shop/
├── backend/           # FastAPI сервер
│   ├── auth/          # JWT автентифікація
│   ├── routes/        # API маршрути (13 модулів)
│   ├── static/covers/ # Обкладинки книг
│   ├── database.py    # Підключення до БД (asyncpg)
│   └── main.py        # Точка входу
├── frontend/          # React SPA
│   └── src/
│       ├── pages/     # Сторінки (каталог, адмін, кошик)
│       ├── components/# Компоненти (навігація, захист маршрутів)
│       └── api/       # HTTP клієнт
├── book_shop.sql      # Схема бази даних
├── seed.sql           # Початкові дані (довідники, адмін)
└── seed_books.sql     # Каталог книг (94 книги)
```

## API

Документація доступна після запуску backend: `http://localhost:8000/docs`
