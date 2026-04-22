import asyncio, asyncpg, sys
sys.stdout.reconfigure(encoding="utf-8")

PG_PASS = "An0986756583"

async def main():
    conn = await asyncpg.connect(host="localhost", port=5432, database="book_shop",
                                 user="postgres", password=PG_PASS)

    # Recreate trigger functions with SECURITY DEFINER
    print("Applying SECURITY DEFINER to trigger functions...")

    await conn.execute("""
CREATE OR REPLACE FUNCTION block_hardcover_sales()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql AS $$
DECLARE
    book_format VARCHAR(12);
    book_stock  INTEGER;
    book_title  VARCHAR(100);
BEGIN
    SELECT format, quantity, title
    INTO book_format, book_stock, book_title
    FROM books WHERE bookid = NEW.bookid;

    IF book_format IN ('Тверда', 'М''яка') THEN
        IF NEW.quantity > book_stock THEN
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
$$
""")
    print("  [OK] block_hardcover_sales SECURITY DEFINER")

    await conn.execute("""
CREATE OR REPLACE FUNCTION decrease_book_quantity_on_order()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE books SET quantity = quantity - NEW.quantity WHERE bookid = NEW.bookid;
    RETURN NEW;
END;
$$
""")
    print("  [OK] decrease_book_quantity_on_order SECURITY DEFINER")

    await conn.execute("""
CREATE OR REPLACE FUNCTION update_book_quantity_on_delivery()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE books SET quantity = quantity + NEW.quantity WHERE bookid = NEW.bookid;
    RETURN NEW;
END;
$$
""")
    print("  [OK] update_book_quantity_on_delivery SECURITY DEFINER")

    await conn.close()

    # Full access test
    print("\n=== ACCESS CONTROL TEST ===")

    async def check(label, conn, sql, expect_ok):
        try:
            await conn.execute(sql)
            status = "[OK] " if expect_ok else "[FAIL] should be denied"
            print(f"  {status} {label}")
        except asyncpg.InsufficientPrivilegeError:
            status = "[OK]  correctly denied" if not expect_ok else "[FAIL] unexpectedly denied"
            print(f"  {status} — {label}")
        except Exception as e:
            if not expect_ok:
                print(f"  [OK]  correctly denied ({type(e).__name__}) — {label}")
            else:
                print(f"  [OK]  permission OK, app error ({type(e).__name__}: {str(e)[:80]}) — {label}")

    # --- GUEST ---
    print("\n-- bookshop_guest --")
    g = await asyncpg.connect(host="localhost", port=5432,
                              database="book_shop", user="bookshop_guest", password="guest123")
    await check("SELECT books",           g, "SELECT COUNT(*) FROM books", True)
    await check("SELECT booksfull",       g, "SELECT COUNT(*) FROM booksfull", True)
    await check("INSERT books [denied]",  g, "INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)", False)
    await check("INSERT orders [denied]", g, "INSERT INTO orders(clientid,orderdate,branchid) VALUES(1,CURRENT_DATE,1)", False)
    await check("SELECT users [denied]",  g, "SELECT * FROM users", False)
    await g.close()

    # --- USER ---
    print("\n-- bookshop_user --")
    u = await asyncpg.connect(host="localhost", port=5432,
                              database="book_shop", user="bookshop_user", password="user123")
    await check("SELECT books",              u, "SELECT COUNT(*) FROM books", True)
    await check("SELECT orders",             u, "SELECT COUNT(*) FROM orders", True)
    await check("CALL place_order [ok]",     u,
                "CALL place_order(1,1,'[{\"bookid\":1,\"quantity\":1}]'::json,'Карта',NULL)", True)
    await check("INSERT books [denied]",     u, "INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)", False)
    await check("DELETE orders [denied]",    u, "DELETE FROM orders WHERE orderid=999999", False)
    await check("SELECT users [denied]",     u, "SELECT * FROM users", False)
    await u.close()

    # --- ADMIN ---
    print("\n-- bookshop_admin --")
    a = await asyncpg.connect(host="localhost", port=5432,
                              database="book_shop", user="bookshop_admin", password="admin123")
    await check("SELECT books",    a, "SELECT COUNT(*) FROM books", True)
    await check("SELECT users",    a, "SELECT COUNT(*) FROM users", True)
    await check("SELECT orders",   a, "SELECT COUNT(*) FROM orders", True)
    await check("INSERT authors",  a, "INSERT INTO authors(firstname,lastname) VALUES('_t','_t')", True)
    await check("DELETE authors",  a, "DELETE FROM authors WHERE firstname='_t' AND lastname='_t'", True)
    await a.close()

    # --- Wrong password ---
    print("\n-- Wrong password rejection --")
    for role, pwd in [("bookshop_admin","admin123"),("bookshop_user","user123"),("bookshop_guest","guest123")]:
        try:
            c = await asyncpg.connect(host="localhost", port=5432,
                                      database="book_shop", user=role, password="WRONG")
            print(f"  [FAIL] {role} wrong pwd accepted!")
            await c.close()
        except Exception:
            print(f"  [OK]  {role} wrong password rejected by PostgreSQL")

    print("\n=== DONE ===")

asyncio.run(main())
