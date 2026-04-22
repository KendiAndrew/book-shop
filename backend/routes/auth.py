from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import get_conn
from auth.security import (
    ROLE_MAP,
    ROLE_PASSWORDS,
    verify_db_credentials,
    create_session,
    delete_session,
    get_current_user,
    require_user,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterBody(BaseModel):
    username: str
    firstname: str
    lastname: str
    email: str
    phone: str
    branchid: int = 1


class LoginBody(BaseModel):
    username: str
    password: str


@router.post("/register")
async def register(body: RegisterBody):
    """Create a new client account (К1).

    Registers the user as bookshop_user role — no password stored in DB,
    authentication uses the shared PostgreSQL role password.
    """
    async with get_conn("admin") as conn:
        exists = await conn.fetchval(
            "SELECT 1 FROM users WHERE username = $1", body.username
        )
        if exists:
            raise HTTPException(status_code=400, detail="Користувач з таким іменем вже існує")

        client = await conn.fetchrow(
            """INSERT INTO clients (firstname, lastname, email, phone, branchid)
               VALUES ($1, $2, $3, $4, $5) RETURNING clientid""",
            body.firstname, body.lastname, body.email, body.phone, body.branchid,
        )

        user = await conn.fetchrow(
            """INSERT INTO users (username, role, clientid)
               VALUES ($1, 'user', $2) RETURNING userid, username, role, clientid""",
            body.username, client["clientid"],
        )

    user_info = {
        "userid": user["userid"],
        "username": user["username"],
        "role": user["role"],
        "clientid": user["clientid"],
        "employeeid": None,
    }
    token = create_session(user_info)
    return {"token": token, "user": user_info}


@router.post("/login")
async def login(body: LoginBody):
    """Authenticate user (К2).

    Looks up the user's role in the users table, then verifies the password
    by attempting a real PostgreSQL connection as that role.
    PostgreSQL itself validates the credentials and rejects on wrong password.
    """
    async with get_conn("admin") as conn:
        row = await conn.fetchrow(
            """SELECT userid, username, role, clientid, employeeid
               FROM users WHERE username = $1""",
            body.username,
        )

    if not row:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")

    app_role = row["role"]
    ok = await verify_db_credentials(app_role, body.password)
    if not ok:
        raise HTTPException(status_code=401, detail="Невірний логін або пароль")

    user_info = {
        "userid": row["userid"],
        "username": row["username"],
        "role": app_role,
        "clientid": row["clientid"],
        "employeeid": row["employeeid"],
    }
    token = create_session(user_info)
    return {"token": token, "user": user_info}


@router.get("/me")
async def me(user: dict = Depends(require_user)):
    return user


@router.post("/logout")
async def logout(
    user: dict = Depends(require_user),
    credentials=Depends(__import__("auth.security", fromlist=["bearer_scheme"]).bearer_scheme),
):
    delete_session(credentials.credentials)
    return {"detail": "Вихід виконано"}
