from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_pool
from auth.security import require_admin, require_user

router = APIRouter(prefix="/api/clients", tags=["Clients"])


class ClientUpdate(BaseModel):
    firstname: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


@router.get("", dependencies=[Depends(require_admin)])
async def get_clients():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT c.*, br.city || ', ' || br.address AS branch
               FROM clients c
               JOIN branches br ON c.branchid = br.branchid
               ORDER BY c.lastname, c.firstname"""
        )
        return [dict(r) for r in rows]


@router.get("/me")
async def get_my_profile(user: dict = Depends(require_user)):
    client_id = user.get("clientid")
    if not client_id:
        raise HTTPException(status_code=404, detail="Профіль клієнта не знайдено")
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """SELECT c.*, br.city || ', ' || br.address AS branch
               FROM clients c JOIN branches br ON c.branchid = br.branchid
               WHERE c.clientid = $1""",
            client_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Профіль не знайдено")
        return dict(row)


@router.put("/me")
async def update_my_profile(body: ClientUpdate, user: dict = Depends(require_user)):
    client_id = user.get("clientid")
    if not client_id:
        raise HTTPException(status_code=400, detail="Профіль клієнта не знайдено")

    pool = await get_pool()
    async with pool.acquire() as conn:
        fields = []
        params = []
        idx = 1
        for field, value in body.model_dump(exclude_none=True).items():
            fields.append(f"{field} = ${idx}")
            params.append(value)
            idx += 1
        if not fields:
            raise HTTPException(status_code=400, detail="Немає полів для оновлення")
        params.append(client_id)
        await conn.execute(
            f"UPDATE clients SET {', '.join(fields)} WHERE clientid = ${idx}", *params
        )
        return {"message": "Профіль оновлено"}
