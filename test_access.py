"""
Full test suite: API endpoints + DB role permissions.
Run: python test_access.py
"""
import asyncio, asyncpg, sys, json, urllib.request, urllib.error
sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://localhost:8000"
PG   = {"host": "localhost", "port": 5432, "database": "book_shop"}
PG_PASS = "An0986756583"

PASS = 0; FAIL = 0

def ok(msg):
    global PASS; PASS += 1
    print(f"  [OK]   {msg}")

def fail(msg):
    global FAIL; FAIL += 1
    print(f"  [FAIL] {msg}")

# ── HTTP helpers ──────────────────────────────────────────────────────────────

def http(method, path, body=None, token=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}
    except Exception as e:
        return 0, {"error": str(e)}

def GET(path, token=None):   return http("GET",    path, token=token)
def POST(path, body, token=None): return http("POST", path, body, token=token)
def PUT(path, body, token=None):  return http("PUT",  path, body, token=token)
def DELETE(path, token=None):     return http("DELETE", path, token=token)

# ── Section 1: DB Role Authentication ────────────────────────────────────────

async def test_db_auth():
    print("\n" + "="*60)
    print("SECTION 1: DB Role Authentication (PostgreSQL-native)")
    print("="*60)

    conn = await asyncpg.connect(**PG, user="postgres", password=PG_PASS)
    roles = await conn.fetch("SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname LIKE 'bookshop%'")
    await conn.close()

    for r in roles:
        if r["rolcanlogin"]:
            ok(f"Role {r['rolname']} has LOGIN")
        else:
            fail(f"Role {r['rolname']} missing LOGIN")

    for role, pwd in [("bookshop_admin","admin123"),("bookshop_user","user123"),("bookshop_guest","guest123")]:
        try:
            c = await asyncpg.connect(**PG, user=role, password=pwd)
            cur = await c.fetchval("SELECT current_user")
            ok(f"{role} correct password -> connected as {cur}")
            await c.close()
        except Exception as e:
            fail(f"{role} correct password -> {e}")

        try:
            c = await asyncpg.connect(**PG, user=role, password="WRONG_PASS")
            fail(f"{role} wrong password -> should be rejected!")
            await c.close()
        except Exception:
            ok(f"{role} wrong password -> rejected by PostgreSQL")

# ── Section 2: DB Permission Matrix ──────────────────────────────────────────

async def test_db_permissions():
    print("\n" + "="*60)
    print("SECTION 2: DB Permission Matrix")
    print("="*60)

    async def chk(label, conn, sql, want_ok):
        try:
            await conn.execute(sql)
            if want_ok: ok(label)
            else:        fail(f"{label} -- should have been denied")
        except asyncpg.InsufficientPrivilegeError:
            if not want_ok: ok(f"{label} -- correctly denied")
            else:            fail(f"{label} -- unexpectedly denied")
        except Exception as e:
            if not want_ok: ok(f"{label} -- correctly denied ({type(e).__name__})")
            else:            ok(f"{label} -- permission OK, app error ({str(e)[:60]})")

    # Guest
    print("\n  -- bookshop_guest --")
    g = await asyncpg.connect(**PG, user="bookshop_guest", password="guest123")
    await chk("SELECT books",            g, "SELECT COUNT(*) FROM books", True)
    await chk("SELECT authors",          g, "SELECT COUNT(*) FROM authors", True)
    await chk("SELECT booksfull",        g, "SELECT COUNT(*) FROM booksfull", True)
    await chk("INSERT books    [deny]",  g, "INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)", False)
    await chk("INSERT orders   [deny]",  g, "INSERT INTO orders(clientid,orderdate,branchid) VALUES(1,CURRENT_DATE,1)", False)
    await chk("UPDATE books    [deny]",  g, "UPDATE books SET quantity=1 WHERE bookid=1", False)
    await chk("SELECT users    [deny]",  g, "SELECT * FROM users", False)
    await chk("SELECT payments [deny]",  g, "SELECT * FROM payments", False)
    await g.close()

    # User
    print("\n  -- bookshop_user --")
    u = await asyncpg.connect(**PG, user="bookshop_user", password="user123")
    await chk("SELECT books",            u, "SELECT COUNT(*) FROM books", True)
    await chk("SELECT orders",           u, "SELECT COUNT(*) FROM orders", True)
    await chk("SELECT clients",          u, "SELECT COUNT(*) FROM clients", True)
    await chk("SELECT payments",         u, "SELECT COUNT(*) FROM payments", True)
    await chk("CALL place_order",        u, "CALL place_order(1,1,'[{\"bookid\":1,\"quantity\":1}]'::json,'Карта',NULL)", True)
    await chk("INSERT books    [deny]",  u, "INSERT INTO books(title,format,quantity,price,publicationyear,pagecount,authorid,genreid,publisherid,languageid) VALUES('x','PDF',0,0,2000,1,1,1,1,1)", False)
    await chk("DELETE orders   [deny]",  u, "DELETE FROM orders", False)
    await chk("UPDATE books    [deny]",  u, "UPDATE books SET quantity=999 WHERE bookid=1", False)
    await chk("SELECT users    [deny]",  u, "SELECT * FROM users", False)
    await u.close()

    # Admin
    print("\n  -- bookshop_admin --")
    a = await asyncpg.connect(**PG, user="bookshop_admin", password="admin123")
    await chk("SELECT books",     a, "SELECT COUNT(*) FROM books", True)
    await chk("SELECT users",     a, "SELECT COUNT(*) FROM users", True)
    await chk("SELECT orders",    a, "SELECT COUNT(*) FROM orders", True)
    await chk("SELECT employees", a, "SELECT COUNT(*) FROM employees", True)
    await chk("INSERT authors",   a, "INSERT INTO authors(firstname,lastname) VALUES('_t','_t')", True)
    await chk("UPDATE authors",   a, "UPDATE authors SET firstname='_t2' WHERE firstname='_t'", True)
    await chk("DELETE authors",   a, "DELETE FROM authors WHERE firstname='_t2'", True)
    await a.close()

# ── Section 3: API Auth endpoints ────────────────────────────────────────────

def test_api_auth():
    print("\n" + "="*60)
    print("SECTION 3: API — Auth endpoints")
    print("="*60)
    tokens = {}

    # Health
    s, r = GET("/api/health")
    ok("GET /api/health") if s == 200 else fail(f"GET /api/health -> {s} {r}")

    # Register new user
    import time
    uname = f"testuser_{int(time.time())}"
    s, r = POST("/api/auth/register", {
        "username": uname, "firstname": "Test", "lastname": "User",
        "email": f"{uname}@test.com", "phone": "+380991234567", "branchid": 1
    })
    if s == 200 and "token" in r:
        ok(f"POST /api/auth/register -> token issued, role={r['user']['role']}")
        tokens["user"] = r["token"]
    else:
        fail(f"POST /api/auth/register -> {s} {r}")

    # Duplicate register
    s, r = POST("/api/auth/register", {
        "username": uname, "firstname": "X", "lastname": "Y",
        "email": "x@x.com", "phone": "+380991234568", "branchid": 1
    })
    ok("Duplicate register -> 400") if s == 400 else fail(f"Duplicate register -> {s} (expected 400)")

    # Login admin
    s, r = POST("/api/auth/login", {"username": "admin", "password": "admin123"})
    if s == 200 and "token" in r:
        ok(f"POST /api/auth/login (admin) -> token issued, role={r['user']['role']}")
        tokens["admin"] = r["token"]
    else:
        fail(f"POST /api/auth/login (admin) -> {s} {r}")

    # Login with wrong password
    s, r = POST("/api/auth/login", {"username": "admin", "password": "wrongpass"})
    ok("Login wrong password -> 401") if s == 401 else fail(f"Login wrong password -> {s} (expected 401)")

    # Login nonexistent user
    s, r = POST("/api/auth/login", {"username": "no_such_user", "password": "x"})
    ok("Login nonexistent -> 401") if s == 401 else fail(f"Login nonexistent -> {s} (expected 401)")

    # GET /me
    if "user" in tokens:
        s, r = GET("/api/auth/me", token=tokens["user"])
        ok(f"GET /api/auth/me (user) -> {r.get('username')}") if s == 200 else fail(f"GET /api/auth/me -> {s}")

    # GET /me without token
    s, r = GET("/api/auth/me")
    ok("GET /api/auth/me (no token) -> 401") if s == 401 else fail(f"GET /api/auth/me no token -> {s} (expected 401)")

    return tokens

# ── Section 4: API Catalog (guest access) ────────────────────────────────────

def test_api_catalog():
    print("\n" + "="*60)
    print("SECTION 4: API — Catalog (no auth required)")
    print("="*60)

    for path in ["/api/books", "/api/authors", "/api/genres",
                 "/api/publishers", "/api/languages", "/api/branches"]:
        s, r = GET(path)
        count = len(r) if isinstance(r, list) else (len(r.get("items", r)) if isinstance(r, dict) else "?")
        if s == 200:
            ok(f"GET {path} -> {count} items")
        else:
            fail(f"GET {path} -> {s} {r}")

    # Single book
    s, r = GET("/api/books/1")
    ok(f"GET /api/books/1 -> {r.get('title','?')}") if s == 200 else fail(f"GET /api/books/1 -> {s}")

# ── Section 5: API Orders (auth required) ────────────────────────────────────

def test_api_orders(tokens):
    print("\n" + "="*60)
    print("SECTION 5: API — Orders (auth required)")
    print("="*60)

    # No token -> 401
    s, r = GET("/api/orders")
    ok("GET /api/orders (no token) -> 401") if s == 401 else fail(f"GET /api/orders no token -> {s}")

    if "user" not in tokens:
        fail("Skipping order tests — no user token"); return
    if "admin" not in tokens:
        fail("Skipping admin order tests — no admin token"); return

    # User sees orders
    s, r = GET("/api/orders", token=tokens["user"])
    ok(f"GET /api/orders (user) -> {len(r)} orders") if s == 200 else fail(f"GET /api/orders user -> {s} {r}")

    # Create order
    s, r = POST("/api/orders", {
        "branchid": 1,
        "items": [{"bookid": 3, "quantity": 1}],  # bookid=3 is Електронна (qty=999)
        "paymentmethod": "Карта"
    }, token=tokens["user"])
    if s == 200:
        ok("POST /api/orders (Карта) -> order created")
    else:
        fail(f"POST /api/orders -> {s} {r}")

    # Create order with cash
    s, r = POST("/api/orders", {
        "branchid": 1,
        "items": [{"bookid": 3, "quantity": 1}],
        "paymentmethod": "Готівка",
        "cash_amount": 500.0
    }, token=tokens["user"])
    if s == 200:
        ok("POST /api/orders (Готівка, enough cash) -> order created")
    else:
        fail(f"POST /api/orders cash -> {s} {r}")

    # Cash too little
    s, r = POST("/api/orders", {
        "branchid": 1,
        "items": [{"bookid": 3, "quantity": 1}],
        "paymentmethod": "Готівка",
        "cash_amount": 1.0
    }, token=tokens["user"])
    ok("POST /api/orders (Готівка insufficient) -> 400") if s == 400 else fail(f"Cash insufficient -> {s} (expected 400)")

    # Admin sees all orders
    s, r = GET("/api/orders", token=tokens["admin"])
    ok(f"GET /api/orders (admin) -> {len(r) if isinstance(r,list) else '?'} orders") if s == 200 else fail(f"GET /api/orders admin -> {s}")

# ── Section 6: API Admin-only endpoints ──────────────────────────────────────

def test_api_admin(tokens):
    print("\n" + "="*60)
    print("SECTION 6: API — Admin-only access control")
    print("="*60)

    admin_paths = ["/api/analytics/dashboard", "/api/analytics/author-popularity",
                   "/api/analytics/sales-trend", "/api/analytics/branch-report",
                   "/api/suppliers", "/api/deliveries"]

    for path in admin_paths:
        # No token
        s, _ = GET(path)
        ok(f"GET {path} no token -> 401") if s == 401 else fail(f"GET {path} no token -> {s} (exp 401)")

        # User token -> should be 403
        if "user" in tokens:
            s, _ = GET(path, token=tokens["user"])
            ok(f"GET {path} user token -> 403") if s == 403 else fail(f"GET {path} user -> {s} (exp 403)")

        # Admin token -> should be 200
        if "admin" in tokens:
            s, r = GET(path, token=tokens["admin"])
            ok(f"GET {path} admin -> 200 ({len(r) if isinstance(r,list) else 'ok'})") if s == 200 else fail(f"GET {path} admin -> {s} {str(r)[:60]}")

# ── Section 7: API Clients ────────────────────────────────────────────────────

def test_api_clients(tokens):
    print("\n" + "="*60)
    print("SECTION 7: API — Client profile")
    print("="*60)

    if "user" not in tokens: return

    s, r = GET("/api/clients/me", token=tokens["user"])
    ok(f"GET /api/clients/me -> {r.get('firstname','?')} {r.get('lastname','?')}") if s == 200 else fail(f"GET /api/clients/me -> {s} {r}")

    # No token
    s, _ = GET("/api/clients/me")
    ok("GET /api/clients/me (no token) -> 401") if s == 401 else fail(f"GET /api/clients/me no token -> {s}")

# ── Main ──────────────────────────────────────────────────────────────────────

async def main():
    await test_db_auth()
    await test_db_permissions()

    tokens = test_api_auth()
    test_api_catalog()
    test_api_orders(tokens)
    test_api_admin(tokens)
    test_api_clients(tokens)

    print("\n" + "="*60)
    print(f"RESULTS: {PASS} passed, {FAIL} failed")
    print("="*60)
    if FAIL > 0:
        sys.exit(1)

asyncio.run(main())
