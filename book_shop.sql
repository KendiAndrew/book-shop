--
-- PostgreSQL: База даних "book_shop"
-- Структура без тестових даних
--

-- ============================================================
-- 1. ДОМЕНИ (користувацькі типи з обмеженнями)
-- ============================================================

-- Домен для електронної пошти
CREATE DOMAIN emaildomain AS VARCHAR(255)
    CONSTRAINT emaildomain_check CHECK (
        VALUE ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    );

-- Домен для українського номера телефону (+380XXXXXXXXX)
CREATE DOMAIN phoneua AS VARCHAR(13)
    CONSTRAINT phoneua_check CHECK (
        VALUE ~ '^\+380[0-9]{9}$'
    );

-- Домен для способу оплати
CREATE DOMAIN paymentmethoddomain AS VARCHAR(10)
    CONSTRAINT paymentmethoddomain_check CHECK (
        VALUE IN ('Готівка', 'Карта')
    );

-- ============================================================
-- 2. ДОВІДНИКОВІ ТАБЛИЦІ (без зовнішніх ключів)
-- ============================================================

-- Жанри книг
CREATE TABLE genres (
    genreid    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    genrename  VARCHAR(30) NOT NULL UNIQUE
);

-- Видавництва
CREATE TABLE publishers (
    publisherid    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    publishername  VARCHAR(55) NOT NULL,
    country        VARCHAR(30) NOT NULL
);

-- Автори
CREATE TABLE authors (
    authorid   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    firstname  VARCHAR(20) NOT NULL,
    lastname   VARCHAR(20) NOT NULL,
    biography  TEXT
);

-- Постачальники
CREATE TABLE suppliers (
    supplierid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    firstname  VARCHAR(20) NOT NULL,
    lastname   VARCHAR(20) NOT NULL,
    email      emaildomain NOT NULL,
    phone      phoneua NOT NULL
);

-- Мови
CREATE TABLE languages (
    languageid    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    languagename  VARCHAR(30) NOT NULL UNIQUE
);

-- ============================================================
-- 3. ОСНОВНІ ТАБЛИЦІ
-- ============================================================

-- Філії магазину
CREATE TABLE branches (
    branchid   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city       VARCHAR(30) NOT NULL,
    address    VARCHAR(255) NOT NULL,
    postcode   VARCHAR(10) NOT NULL,
    managerid  INTEGER  -- FK додається пізніше (циклічна залежність з employees)
);

-- Працівники
CREATE TABLE employees (
    employeeid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    firstname  VARCHAR(20) NOT NULL,
    lastname   VARCHAR(20) NOT NULL,
    position   VARCHAR(20) NOT NULL,
    email      emaildomain NOT NULL,
    hiredate   DATE NOT NULL DEFAULT CURRENT_DATE,
    branchid   INTEGER NOT NULL REFERENCES branches(branchid) ON DELETE RESTRICT
);

-- Додаємо FK branches.managerid -> employees (після створення employees)
ALTER TABLE branches
    ADD CONSTRAINT branches_managerid_fkey
    FOREIGN KEY (managerid) REFERENCES employees(employeeid) ON DELETE SET NULL;

-- Клієнти
CREATE TABLE clients (
    clientid   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    firstname  VARCHAR(20) NOT NULL,
    lastname   VARCHAR(20) NOT NULL,
    email      emaildomain NOT NULL,
    phone      phoneua NOT NULL,
    branchid   INTEGER NOT NULL REFERENCES branches(branchid) ON DELETE RESTRICT
);

-- Книги
CREATE TABLE books (
    bookid          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           VARCHAR(100) NOT NULL,
    authorid        INTEGER NOT NULL REFERENCES authors(authorid) ON DELETE RESTRICT,
    genreid         INTEGER NOT NULL REFERENCES genres(genreid) ON DELETE RESTRICT,
    publisherid     INTEGER NOT NULL REFERENCES publishers(publisherid) ON DELETE RESTRICT,
    format          VARCHAR(12) NOT NULL
                        CONSTRAINT books_format_check CHECK (format IN ('Тверда', 'М''яка', 'Електронна')),
    quantity        INTEGER NOT NULL DEFAULT 0
                        CONSTRAINT books_quantity_check CHECK (quantity >= 0),
    price           NUMERIC(10,2) NOT NULL
                        CONSTRAINT books_price_check CHECK (price >= 0),
    supplierid      INTEGER REFERENCES suppliers(supplierid) ON DELETE SET NULL,
    publicationyear INTEGER NOT NULL
                        CONSTRAINT books_publicationyear_check CHECK (publicationyear > 0),
    languageid      INTEGER NOT NULL REFERENCES languages(languageid) ON DELETE RESTRICT,
    pagecount       INTEGER NOT NULL
                        CONSTRAINT books_pagecount_check CHECK (pagecount > 0),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Замовлення
CREATE TABLE orders (
    orderid    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clientid   INTEGER NOT NULL REFERENCES clients(clientid) ON DELETE RESTRICT,
    orderdate  DATE NOT NULL DEFAULT CURRENT_DATE,
    branchid   INTEGER NOT NULL REFERENCES branches(branchid) ON DELETE RESTRICT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Деталі замовлення
CREATE TABLE orderdetails (
    orderdetailid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    orderid       INTEGER NOT NULL REFERENCES orders(orderid) ON DELETE CASCADE,
    bookid        INTEGER NOT NULL REFERENCES books(bookid) ON DELETE RESTRICT,
    quantity      INTEGER NOT NULL
                      CONSTRAINT orderdetails_quantity_check CHECK (quantity > 0),
    unitprice     NUMERIC(10,2) NOT NULL
                      CONSTRAINT orderdetails_unitprice_check CHECK (unitprice >= 0)
);

-- Платежі
CREATE TABLE payments (
    paymentid     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    clientid      INTEGER NOT NULL REFERENCES clients(clientid) ON DELETE RESTRICT,
    amount        NUMERIC(10,2) NOT NULL
                      CONSTRAINT payments_amount_check CHECK (amount > 0),
    paymentdate   DATE NOT NULL DEFAULT CURRENT_DATE,
    paymentmethod paymentmethoddomain NOT NULL
);

-- Акції / промоції
CREATE TABLE promotions (
    promotionid INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    discount    NUMERIC(5,2) NOT NULL
                    CONSTRAINT promotions_discount_check CHECK (discount > 0 AND discount <= 100),
    startdate   DATE NOT NULL,
    enddate     DATE NOT NULL,
    bookid      INTEGER NOT NULL REFERENCES books(bookid) ON DELETE CASCADE,
    branchid    INTEGER NOT NULL REFERENCES branches(branchid) ON DELETE CASCADE,
    CONSTRAINT promotions_dates_check CHECK (enddate >= startdate)
);

-- Поставки книг
CREATE TABLE bookdeliveries (
    deliveryid    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    supplierid    INTEGER NOT NULL REFERENCES suppliers(supplierid) ON DELETE RESTRICT,
    deliverydate  DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity      INTEGER NOT NULL
                      CONSTRAINT bookdeliveries_quantity_check CHECK (quantity > 0),
    bookid        INTEGER NOT NULL REFERENCES books(bookid) ON DELETE RESTRICT,
    deliveryprice NUMERIC(10,2) NOT NULL
                      CONSTRAINT bookdeliveries_deliveryprice_check CHECK (deliveryprice >= 0)
);

-- Посилання на електронні версії книг
CREATE TABLE booklinks (
    linkid     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bookid     INTEGER NOT NULL REFERENCES books(bookid) ON DELETE CASCADE,
    url        VARCHAR(2083) NOT NULL,
    fileformat VARCHAR(10) NOT NULL
                   CONSTRAINT booklinks_fileformat_check CHECK (fileformat IN ('PDF', 'EPUB', 'MOBI', 'FB2'))
);

-- Користувачі (для аутентифікації та авторизації)
CREATE TABLE users (
    userid        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(15) NOT NULL DEFAULT 'user'
                      CONSTRAINT users_role_check CHECK (role IN ('admin', 'user', 'guest')),
    employeeid    INTEGER UNIQUE REFERENCES employees(employeeid) ON DELETE SET NULL,
    clientid      INTEGER UNIQUE REFERENCES clients(clientid) ON DELETE SET NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT users_one_link_check CHECK (
        NOT (employeeid IS NOT NULL AND clientid IS NOT NULL)
    )
);

-- ============================================================
-- 4. ІНДЕКСИ
-- ============================================================

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_authorid ON books(authorid);
CREATE INDEX idx_books_genreid ON books(genreid);
CREATE INDEX idx_books_languageid ON books(languageid);
CREATE INDEX idx_orders_clientid ON orders(clientid);
CREATE INDEX idx_orders_orderdate ON orders(orderdate);
CREATE INDEX idx_orderdetails_orderid ON orderdetails(orderid);
CREATE INDEX idx_orderdetails_bookid ON orderdetails(bookid);
CREATE INDEX idx_clients_branchid ON clients(branchid);
CREATE INDEX idx_employees_branchid ON employees(branchid);
CREATE INDEX idx_bookdeliveries_bookid ON bookdeliveries(bookid);
CREATE INDEX idx_payments_clientid ON payments(clientid);

-- ============================================================
-- 5. ПРЕДСТАВЛЕННЯ (VIEWS)
-- ============================================================

-- Повна інформація про книгу (з автором, жанром, видавцем, мовою)
CREATE VIEW booksfull AS
SELECT
    b.bookid,
    b.title,
    a.firstname || ' ' || a.lastname AS author,
    g.genrename AS genre,
    p.publishername AS publisher,
    l.languagename AS language,
    b.format,
    b.quantity,
    b.price,
    b.publicationyear,
    b.pagecount
FROM books b
JOIN authors a ON b.authorid = a.authorid
JOIN genres g ON b.genreid = g.genreid
JOIN publishers p ON b.publisherid = p.publisherid
JOIN languages l ON b.languageid = l.languageid;

-- Популярність авторів: продажі по форматах
CREATE VIEW authorpopularity AS
SELECT
    a.authorid,
    a.firstname,
    a.lastname,
    COALESCE(SUM(CASE WHEN b.format = 'Тверда' THEN od.quantity ELSE 0 END), 0) AS hardcoversales,
    COALESCE(SUM(CASE WHEN b.format = 'Електронна' THEN od.quantity ELSE 0 END), 0) AS electronicsales,
    COALESCE(SUM(od.quantity), 0) AS totalsales
FROM authors a
LEFT JOIN books b ON a.authorid = b.authorid
LEFT JOIN orderdetails od ON b.bookid = od.bookid
GROUP BY a.authorid, a.firstname, a.lastname;

-- Тренд продажів книг по місяцях (без хардкоду bookid)
CREATE VIEW booksalestrend AS
SELECT
    DATE_TRUNC('month', o.orderdate) AS salemonth,
    b.bookid,
    b.title,
    SUM(od.quantity) AS monthlysales,
    AVG(SUM(od.quantity)) OVER (
        PARTITION BY b.bookid
        ORDER BY DATE_TRUNC('month', o.orderdate)
    ) AS avgsalespermonth,
    SUM(od.quantity) - LAG(SUM(od.quantity)) OVER (
        PARTITION BY b.bookid
        ORDER BY DATE_TRUNC('month', o.orderdate)
    ) AS salesdeviation
FROM books b
JOIN orderdetails od ON b.bookid = od.bookid
JOIN orders o ON od.orderid = o.orderid
GROUP BY b.bookid, b.title, DATE_TRUNC('month', o.orderdate);

-- Звіт продажів по філіях
CREATE VIEW branchsalesreport AS
SELECT
    br.branchid,
    br.city,
    br.address,
    COUNT(DISTINCT o.orderid) AS totalorders,
    COALESCE(SUM(od.quantity), 0) AS totalbookssold,
    COALESCE(SUM(od.quantity * od.unitprice), 0) AS totalrevenue
FROM branches br
LEFT JOIN orders o ON br.branchid = o.branchid
LEFT JOIN orderdetails od ON o.orderid = od.orderid
GROUP BY br.branchid, br.city, br.address;

-- ============================================================
-- 6. ФУНКЦІЇ
-- ============================================================

-- Функція-тригер: блокує продаж твердої копії, якщо недостатньо на складі
CREATE OR REPLACE FUNCTION block_hardcover_sales()
RETURNS TRIGGER AS $$
DECLARE
    book_format VARCHAR(12);
    book_stock  INTEGER;
    book_title  VARCHAR(100);
BEGIN
    SELECT format, quantity, title
    INTO book_format, book_stock, book_title
    FROM books
    WHERE bookid = NEW.bookid;

    -- Перевіряємо лише тверді та м'які копії (фізичні)
    IF book_format IN ('Тверда', 'М''яка') THEN
        IF NEW.quantity > book_stock THEN
            -- Перевіряємо наявність електронної версії
            IF EXISTS (
                SELECT 1 FROM books
                WHERE title = book_title AND format = 'Електронна'
            ) THEN
                RAISE EXCEPTION 'Недостатньо копій "%" (на складі: %). Пропонуємо електронну версію.', book_title, book_stock;
            ELSE
                RAISE EXCEPTION 'Недостатньо копій "%" (на складі: %). Електронна версія відсутня.', book_title, book_stock;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функція: розрахунок динаміки продажів книги
CREATE OR REPLACE FUNCTION calculate_sales_dynamics(p_book_id INTEGER)
RETURNS TABLE (
    current_month_sales  NUMERIC,
    previous_month_sales NUMERIC,
    sales_ratio          NUMERIC,
    total_store_sales    NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', o.orderdate) = DATE_TRUNC('month', CURRENT_DATE)
            THEN od.quantity ELSE 0
        END), 0)::NUMERIC AS current_month_sales,

        COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', o.orderdate) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
            THEN od.quantity ELSE 0
        END), 0)::NUMERIC AS previous_month_sales,

        CASE
            WHEN SUM(CASE
                WHEN DATE_TRUNC('month', o.orderdate) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                THEN od.quantity ELSE 0
            END) = 0 THEN NULL
            ELSE ROUND(
                SUM(CASE
                    WHEN DATE_TRUNC('month', o.orderdate) = DATE_TRUNC('month', CURRENT_DATE)
                    THEN od.quantity ELSE 0
                END)::NUMERIC
                /
                SUM(CASE
                    WHEN DATE_TRUNC('month', o.orderdate) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
                    THEN od.quantity ELSE 0
                END)::NUMERIC, 2)
        END AS sales_ratio,

        COALESCE(SUM(od.quantity * od.unitprice), 0)::NUMERIC AS total_store_sales
    FROM orders o
    JOIN orderdetails od ON o.orderid = od.orderid
    WHERE od.bookid = p_book_id;
END;
$$ LANGUAGE plpgsql;

-- Функція-тригер: автоматичне оновлення кількості книг при поставці
CREATE OR REPLACE FUNCTION update_book_quantity_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET quantity = quantity + NEW.quantity
    WHERE bookid = NEW.bookid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Функція-тригер: зменшення кількості книг при створенні деталі замовлення
CREATE OR REPLACE FUNCTION decrease_book_quantity_on_order()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE books
    SET quantity = quantity - NEW.quantity
    WHERE bookid = NEW.bookid;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Агрегатна функція: середня вартість сторінки
CREATE OR REPLACE FUNCTION avg_page_cost_state(state NUMERIC, price NUMERIC, page_count INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    IF page_count <= 0 THEN
        RETURN state;
    END IF;
    IF state IS NULL THEN
        RETURN price / page_count;
    END IF;
    RETURN state + (price / page_count);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION avg_page_cost_final(state NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    IF state IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(state, 4);
END;
$$ LANGUAGE plpgsql;

CREATE AGGREGATE avgpagecost(NUMERIC, INTEGER) (
    SFUNC = avg_page_cost_state,
    STYPE = NUMERIC,
    FINALFUNC = avg_page_cost_final
);

-- ============================================================
-- 7. ТРИГЕРИ
-- ============================================================

-- Перевірка наявності книги перед продажем
CREATE TRIGGER trg_check_stock
    BEFORE INSERT OR UPDATE ON orderdetails
    FOR EACH ROW
    WHEN (NEW.bookid IS NOT NULL)
    EXECUTE FUNCTION block_hardcover_sales();

-- Автооновлення кількості книг при поставці
CREATE TRIGGER trg_delivery_update_stock
    AFTER INSERT ON bookdeliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_book_quantity_on_delivery();

-- Зменшення кількості книг при замовленні
CREATE TRIGGER trg_order_decrease_stock
    AFTER INSERT ON orderdetails
    FOR EACH ROW
    EXECUTE FUNCTION decrease_book_quantity_on_order();

-- ============================================================
-- 8. ПРОЦЕДУРА: Оформлення замовлення
-- ============================================================

CREATE OR REPLACE PROCEDURE create_order(
    p_clientid  INTEGER,
    p_branchid  INTEGER,
    p_bookid    INTEGER,
    p_quantity  INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    v_orderid   INTEGER;
    v_unitprice NUMERIC(10,2);
BEGIN
    -- Отримуємо ціну книги
    SELECT price INTO v_unitprice
    FROM books WHERE bookid = p_bookid;

    IF v_unitprice IS NULL THEN
        RAISE EXCEPTION 'Книгу з ID % не знайдено', p_bookid;
    END IF;

    -- Створюємо замовлення
    INSERT INTO orders (clientid, orderdate, branchid)
    VALUES (p_clientid, CURRENT_DATE, p_branchid)
    RETURNING orderid INTO v_orderid;

    -- Додаємо деталі замовлення (тригери перевірять наявність та зменшать кількість)
    INSERT INTO orderdetails (orderid, bookid, quantity, unitprice)
    VALUES (v_orderid, p_bookid, p_quantity, v_unitprice);
END;
$$;
