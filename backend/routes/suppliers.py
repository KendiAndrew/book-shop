from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


class SupplierBody(BaseModel):
    firstname: str
    lastname: str
    email: str
    phone: str


@router.get("", dependencies=[Depends(require_admin)])
async def get_suppliers():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM suppliers ORDER BY lastname, firstname")
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_supplier(body: SupplierBody):
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                "INSERT INTO suppliers (firstname, lastname, email, phone) VALUES ($1,$2,$3,$4) RETURNING supplierid",
                body.firstname, body.lastname, body.email, body.phone,
            )
            return {"supplierid": row["supplierid"], "message": "Постачальника створено"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))


@router.put("/{sup_id}", dependencies=[Depends(require_admin)])
async def update_supplier(sup_id: int, body: SupplierBody):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE suppliers SET firstname=$1, lastname=$2, email=$3, phone=$4 WHERE supplierid=$5",
            body.firstname, body.lastname, body.email, body.phone, sup_id,
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Постачальника не знайдено")
        return {"message": "Постачальника оновлено"}


@router.delete("/{sup_id}", dependencies=[Depends(require_admin)])
async def delete_supplier(sup_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM suppliers WHERE supplierid = $1", sup_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Постачальника не знайдено")
        return {"message": "Постачальника видалено"}
