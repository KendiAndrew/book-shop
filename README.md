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
git clone https://github.com/KendiAndrew/book-shop.git
cd book-shop
```

### 2. База даних

Переконайтесь, що PostgreSQL запущений. Створіть базу та заповніть її:

```bash
psql -h localhost -U postgres -c "CREATE DATABASE book_shop ENCODING 'UTF8';"
psql -h localhost -U postgres -d book_shop -f book_shop.sql
psql -h localhost -U postgres -d book_shop -f seed.sql
psql -h localhost -U postgres -d book_shop -f seed_books.sql
```

`book_shop.sql` автоматично створює три PostgreSQL-ролі з правом LOGIN:

| Роль | Пароль | Привілеї |
|---|---|---|
| `bookshop_admin` | `admin123` | Повний доступ до всіх таблиць |
| `bookshop_user` | `user123` | SELECT каталог, INSERT замовлення, CALL place_order |
| `bookshop_guest` | `guest123` | SELECT публічний каталог |

### 3. Backend

```bash
cd backend
pip install -r requirements.txt
```

Файл `.env` (вже є в репозиторії):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=book_shop

DB_ADMIN_USER=bookshop_admin
DB_ADMIN_PASSWORD=admin123
DB_USER_USER=bookshop_user
DB_USER_PASSWORD=user123
DB_GUEST_USER=bookshop_guest
DB_GUEST_PASSWORD=guest123
```

Запуск сервера:

```bash
python -m uvicorn main:app --reload --port 8000
```

Backend буде доступний на `http://localhost:8000`  
Swagger документація: `http://localhost:8000/docs`

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend буде доступний на `http://localhost:3001`

### 5. Тестовий вхід

- **Адмін:** логін `admin`, пароль `admin123`
- **Нові клієнти** реєструються через форму реєстрації (пароль — `user123`, спільний для ролі bookshop_user)

### 6. Запуск тестів

```bash
python test_access.py
```

Перевіряє 74 тест-кейси: DB-автентифікацію, матрицю привілеїв ролей та всі API-ендпоінти.

## Архітектура безпеки

Автентифікація реалізована на рівні СУБД:

1. При логіні backend знаходить роль користувача в таблиці `users`
2. Намагається підключитись до PostgreSQL від імені відповідної ролі з наданим паролем
3. PostgreSQL сам перевіряє пароль — при невірному повертає помилку і підключення відхиляється
4. При успіху створюється серверна сесія (UUID-токен у пам'яті)
5. Три окремих пули з'єднань — кожен підключений від імені своєї ролі

Паролі **не зберігаються** в таблиці `users` — лише у системному каталозі PostgreSQL (`pg_authid`).

## Структура проекту

```
book-shop/
├── backend/            # FastAPI сервер
│   ├── auth/           # DB-автентифікація, серверні сесії
│   ├── routes/         # API маршрути (13 модулів)
│   ├── static/covers/  # Обкладинки книг
│   ├── database.py     # Три пули asyncpg (admin/user/guest)
│   └── main.py         # Точка входу
├── frontend/           # React SPA
│   └── src/
│       ├── pages/      # Сторінки (каталог, адмін, кошик)
│       ├── components/ # Компоненти (навігація, захист маршрутів)
│       └── api/        # HTTP клієнт
├── book_shop.sql       # Схема БД + ролі + процедура place_order
├── seed.sql            # Базові довідники та адмін
├── seed_books.sql      # Каталог книг
└── test_access.py      # Тести DB-ролей та API (74 тест-кейси)
```
