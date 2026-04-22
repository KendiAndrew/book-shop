"""
Access control test for BookShop.
Tests DB-level authentication and role permissions.
Run: python test_access.py
"""
import asyncio
import asyncpg

DB = {"host": "localhost", "port": 5432, "database": "book_shop"}

ROLES = {
    "bookshop_admin": "admin123",
    "bookshop_user":  "user123",
    "bookshop_guest": "guest123",
}

OK  = "\033[92m[OK]\033[0m"
ERR = "\033[91m[FAIL]\033[0m"
INF = "\033[94m[INFO]\033[0m"


async def try_connect(user: str, password: str) -> asyncpg.Connection | None:
    try:
        conn = await asyncpg.connect(**DB, user=user, password=password)
        return conn
    except (asyncpg.InvalidPasswordError,
            asyncpg.InvalidAuthorizationSpecificationError):
        return None
    except Exception as e:
        print(f"  {ERR} Unexpected connection error for {user}: {e}")
        return None


async def check(label: str, coro, expect_ok: bool):
    try:
        result = await coro
        if expect_ok:
            print(f"  {OK}  {label}")
        else:
            print(f"  {ERR} {label} — should have been denied but succeeded")
    except asyncpg.InsufficientPrivilegeError:
        if not expect_ok:
            print(f"  {OK}  {label} — correctly denied (permission denied)")
        else:
            print(f"  {ERR} {label} — unexpectedly denied")
    except Exception as e:
        if not expect_ok:
            print(f"  {OK}  {label} — correctly denied ({type(e).__name__})")
        else:
            print(f"  {ERR} {label} — {e}")


async def main():
    # ── 1. Login verification ──────────────────────────────────────────────
    print("\n=== 1. Login verification (PostgreSQL-native auth) ===")

    for role, pwd in ROLES.items():
        conn = await try_connect(role, pwd)
        if conn:
            print(f"  {OK}  {role} / correct password → connected")
            await conn.close()
        else:
            print(f"  {ERR} {role} / correct password → FAILED")

    for role in ROLES:
        conn = await try_connect(role, "wrong_password")
        if conn is None:
            print(f"  {OK}  {role} / wrong password → rejected by PostgreSQL")
            await conn.close() if conn else None
        else:
            print(f"  {ERR} {role} / wrong password → should have been rejected!")
            await conn.close()

    # ── 2. Guest permissions ───────────────────────────────────────────────
    print("\n=== 2. bookshop_guest permissions ===")
    g = await try_connect("bookshop_guest", "guest123")
    if not g:
        print(f"  {ERR} Could not connect as guest")
        return

    await check("SELECT books",
                g.fetchval("SELECT COUNT(*) FROM books"), True)
    await check("SELECT authors",
                g.fetchval("SELECT COUNT(*) FROM authors"), True)
    await check("SELECT booksfull view",
                g.fetchval("SELECT COUNT(*) FROM booksfull"), True)
    await check("INSERT books (must be denied)",
                g.execute("INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)"), False)
    await check("INSERT orders (must be denied)",
                g.execute("INSERT INTO orders(clientid,orderdate,branchid) VALUES(1,CURRENT_DATE,1)"), False)
    await check("SELECT users (must be denied)",
                g.fetch("SELECT * FROM users"), False)
    await g.close()

    # ── 3. User permissions ────────────────────────────────────────────────
    print("\n=== 3. bookshop_user permissions ===")
    u = await try_connect("bookshop_user", "user123")
    if not u:
        print(f"  {ERR} Could not connect as user")
        return

    await check("SELECT books",
                u.fetchval("SELECT COUNT(*) FROM books"), True)
    await check("SELECT orders",
                u.fetchval("SELECT COUNT(*) FROM orders"), True)
    await check("SELECT clients",
                u.fetchval("SELECT COUNT(*) FROM clients"), True)
    await check("CALL place_order (must succeed or raise app error, not permission denied)",
                u.execute(
                    "CALL place_order($1,$2,$3::json,$4,$5)",
                    1, 1, '[{"bookid":1,"quantity":1}]', "Карта", None
                ), True)
    await check("INSERT books (must be denied)",
                u.execute("INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)"), False)
    await check("DELETE orders (must be denied)",
                u.execute("DELETE FROM orders WHERE orderid = 999999"), False)
    await check("SELECT users (must be denied)",
                u.fetch("SELECT * FROM users"), False)
    await u.close()

    # ── 4. Admin permissions ───────────────────────────────────────────────
    print("\n=== 4. bookshop_admin permissions ===")
    a = await try_connect("bookshop_admin", "admin123")
    if not a:
        print(f"  {ERR} Could not connect as admin")
        return

    await check("SELECT books",    a.fetchval("SELECT COUNT(*) FROM books"), True)
    await check("SELECT users",    a.fetchval("SELECT COUNT(*) FROM users"), True)
    await check("SELECT orders",   a.fetchval("SELECT COUNT(*) FROM orders"), True)
    await check("SELECT clients",  a.fetchval("SELECT COUNT(*) FROM clients"), True)
    await check("SELECT employees",a.fetchval("SELECT COUNT(*) FROM employees"), True)
    await check("INSERT authors (must succeed)",
                a.execute("INSERT INTO authors(firstname,lastname) VALUES('Test','Test') ON CONFLICT DO NOTHING"), True)
    await check("DELETE authors (must succeed)",
                a.execute("DELETE FROM authors WHERE firstname='Test' AND lastname='Test'"), True)
    await a.close()

    # ── 5. verify_db_credentials function ─────────────────────────────────
    print("\n=== 5. verify_db_credentials() flow ===")
    import sys
    sys.path.insert(0, "backend")

    # Simulate the auth flow inline (no FastAPI needed)
    async def verify(app_role: str, password: str) -> bool:
        role_map = {"admin": "bookshop_admin", "user": "bookshop_user", "guest": "bookshop_guest"}
        pg_user = role_map.get(app_role)
        try:
            conn = await asyncpg.connect(**DB, user=pg_user, password=password)
            await conn.close()
            return True
        except (asyncpg.InvalidPasswordError, asyncpg.InvalidAuthorizationSpecificationError):
            return False

    cases = [
        ("admin", "admin123", True),
        ("user",  "user123",  True),
        ("guest", "guest123", True),
        ("admin", "wrongpass", False),
        ("user",  "admin123",  False),
    ]
    for app_role, pwd, expected in cases:
        result = await verify(app_role, pwd)
        status = OK if result == expected else ERR
        tag = "✓ auth OK" if result else "✗ rejected"
        print(f"  {status}  verify({app_role!r}, {'correct' if expected else 'wrong'!r}) → {tag}")

    print("\n=== Done ===\n")


asyncio.run(main())
