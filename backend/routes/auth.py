from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database import get_pool
from auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class RegisterBody(BaseModel):
    username: str
    password: str
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
    pool = await get_pool()
    async with pool.acquire() as conn:
        # check username
        exists = await conn.fetchval("SELECT 1 FROM users WHERE username = $1", body.username)
        if exists:
            raise HTTPException(status_code=400, detail="Користувач з таким іменем вже існує")

        # create client first
        client = await conn.fetchrow(
            """INSERT INTO clients (firstname, lastname, email, phone, branchid)
               VALUES ($1, $2, $3, $4, $5) RETURNING clientid""",
            body.firstname, body.lastname, body.email, body.phone, body.branchid,
        )

        # create user
        pwd_hash = hash_password(body.password)
        user = await conn.fetchrow(
            """INSERT INTO users (username, password_hash, role, clientid)
               VALUES ($1, $2, 'user', $3) RETURNING userid, username, role""",
            body.username, pwd_hash, client["clientid"],
        )

        token = create_access_token({
            "sub": str(user["userid"]),
            "username": user["username"],
            "role": user["role"],
            "clientid": client["clientid"],
        })
        return {"token": token, "user": dict(user)}


@router.post("/login")
async def login(body: LoginBody):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """SELECT u.userid, u.username, u.password_hash, u.role, u.clientid, u.employeeid
               FROM users u WHERE u.username = $1""",
            body.username,
        )
        if not row or not verify_password(body.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Невірний логін або пароль")

        payload = {
            "sub": str(row["userid"]),
            "username": row["username"],
            "role": row["role"],
        }
        if row["clientid"]:
            payload["clientid"] = row["clientid"]
        if row["employeeid"]:
            payload["employeeid"] = row["employeeid"]

        token = create_access_token(payload)
        return {
            "token": token,
            "user": {
                "userid": row["userid"],
                "username": row["username"],
                "role": row["role"],
            },
        }


@router.get("/me")
async def me(token: str):
    from auth.security import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Невалідний токен")

    pool = await get_pool()
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT userid, username, role, clientid, employeeid FROM users WHERE userid = $1",
            int(payload["sub"]),
        )
        if not user:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")
        return dict(user)
