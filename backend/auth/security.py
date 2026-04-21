import os
import secrets
import asyncpg
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "book_shop"),
}

ROLE_MAP = {
    "admin": os.getenv("DB_ADMIN_USER", "bookshop_admin"),
    "user": os.getenv("DB_USER_USER", "bookshop_user"),
    "guest": os.getenv("DB_GUEST_USER", "bookshop_guest"),
}

ROLE_PASSWORDS = {
    "admin": os.getenv("DB_ADMIN_PASSWORD", "admin123"),
    "user": os.getenv("DB_USER_PASSWORD", "user123"),
    "guest": os.getenv("DB_GUEST_PASSWORD", "guest123"),
}

# In-memory session store: token -> user info dict
_sessions: dict[str, dict] = {}

bearer_scheme = HTTPBearer(auto_error=False)


async def verify_db_credentials(app_role: str, password: str) -> bool:
    """Verify credentials by attempting a real PostgreSQL connection as that role.

    Authentication happens entirely inside PostgreSQL — the DB rejects
    the connection with invalid_password if the password is wrong.
    """
    pg_user = ROLE_MAP.get(app_role)
    if not pg_user:
        return False
    try:
        conn = await asyncpg.connect(**DB_CONFIG, user=pg_user, password=password)
        await conn.close()
        return True
    except (
        asyncpg.InvalidPasswordError,
        asyncpg.InvalidAuthorizationSpecificationError,
    ):
        return False


def create_session(user_info: dict) -> str:
    token = secrets.token_urlsafe(32)
    _sessions[token] = user_info
    return token


def get_session(token: str) -> dict | None:
    return _sessions.get(token)


def delete_session(token: str) -> None:
    _sessions.pop(token, None)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    """Returns user info from session or None for guests."""
    if credentials is None:
        return None
    return get_session(credentials.credentials)


async def require_user(user: dict | None = Depends(get_current_user)) -> dict:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Необхідна авторизація",
        )
    return user


async def require_admin(user: dict = Depends(require_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Тільки для адміністратора",
        )
    return user
