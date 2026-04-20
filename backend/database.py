import os
import asyncpg
from contextlib import asynccontextmanager

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "user": os.getenv("DB_USER", "bookshop_app"),
    "password": os.getenv("DB_PASSWORD", "bookshop_app_password"),
    "database": os.getenv("DB_NAME", "book_shop"),
}

ROLE_MAP = {
    "admin": "bookshop_admin",
    "user": "bookshop_user",
}
GUEST_ROLE = "bookshop_guest"

pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(**DB_CONFIG, min_size=2, max_size=10)
    return pool


async def close_pool():
    global pool
    if pool:
        await pool.close()
        pool = None


@asynccontextmanager
async def get_conn(role: str | None = None):
    """Acquire a DB connection with PostgreSQL role set via SET ROLE.

    role=None  -> no SET ROLE (used for auth endpoints)
    role="admin"/"user" -> maps to bookshop_admin / bookshop_user
    role=anything else  -> bookshop_guest
    """
    p = await get_pool()
    async with p.acquire() as conn:
        if role is not None:
            db_role = ROLE_MAP.get(role, GUEST_ROLE)
            await conn.execute(f"SET ROLE {db_role}")
        try:
            yield conn
        finally:
            if role is not None:
                await conn.execute("RESET ROLE")
