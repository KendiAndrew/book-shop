import os
import asyncpg
from contextlib import asynccontextmanager

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "book_shop"),
}

ROLE_CREDENTIALS = {
    "admin": {
        "user": os.getenv("DB_ADMIN_USER", "bookshop_admin"),
        "password": os.getenv("DB_ADMIN_PASSWORD", "admin123"),
    },
    "user": {
        "user": os.getenv("DB_USER_USER", "bookshop_user"),
        "password": os.getenv("DB_USER_PASSWORD", "user123"),
    },
    "guest": {
        "user": os.getenv("DB_GUEST_USER", "bookshop_guest"),
        "password": os.getenv("DB_GUEST_PASSWORD", "guest123"),
    },
}

pools: dict[str, asyncpg.Pool | None] = {
    "admin": None,
    "user": None,
    "guest": None,
}


async def get_pool(role: str) -> asyncpg.Pool:
    if role not in pools:
        role = "guest"
    if pools[role] is None:
        creds = ROLE_CREDENTIALS[role]
        pools[role] = await asyncpg.create_pool(
            **DB_CONFIG,
            user=creds["user"],
            password=creds["password"],
            min_size=2,
            max_size=10,
        )
    return pools[role]


async def close_pools():
    for role in list(pools.keys()):
        if pools[role]:
            await pools[role].close()
            pools[role] = None


@asynccontextmanager
async def get_conn(role: str = "guest"):
    """Acquire a DB connection from the pool for the given app role.

    role="admin"  -> connects as bookshop_admin (full access)
    role="user"   -> connects as bookshop_user  (limited access)
    role="guest"  -> connects as bookshop_guest (read-only)
    """
    p = await get_pool(role)
    async with p.acquire() as conn:
        yield conn
