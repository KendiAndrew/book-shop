from fastapi import APIRouter, Depends
from pydantic import BaseModel
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/deliveries", tags=["Deliveries"])


class DeliveryCreate(BaseModel):
    supplierid: int
    bookid: int
    quantity: int
    deliveryprice: float


@router.get("", dependencies=[Depends(require_admin)])
async def get_deliveries():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT d.*, b.title AS book,
                      s.firstname || ' ' || s.lastname AS supplier
               FROM bookdeliveries d
               JOIN books b ON d.bookid = b.bookid
               JOIN suppliers s ON d.supplierid = s.supplierid
               ORDER BY d.deliverydate DESC"""
        )
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_delivery(body: DeliveryCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO bookdeliveries (supplierid, deliverydate, quantity, bookid, deliveryprice)
               VALUES ($1, CURRENT_DATE, $2, $3, $4) RETURNING deliveryid""",
            body.supplierid, body.quantity, body.bookid, body.deliveryprice,
        )
        return {"deliveryid": row["deliveryid"], "message": "Поставку створено (кількість книг оновлено автоматично)"}
