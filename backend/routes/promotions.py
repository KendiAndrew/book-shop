from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/promotions", tags=["Promotions"])


class PromotionBody(BaseModel):
    title: str
    discount: float
    startdate: str
    enddate: str
    bookid: int
    branchid: int


@router.get("")
async def get_promotions():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """SELECT pr.*, b.title AS book,
                      br.city || ', ' || br.address AS branch
               FROM promotions pr
               JOIN books b ON pr.bookid = b.bookid
               JOIN branches br ON pr.branchid = br.branchid
               ORDER BY pr.startdate DESC"""
        )
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_promotion(body: PromotionBody):
    from datetime import date as dt_date
    pool = await get_pool()
    async with pool.acquire() as conn:
        start = dt_date.fromisoformat(body.startdate)
        end = dt_date.fromisoformat(body.enddate)
        row = await conn.fetchrow(
            """INSERT INTO promotions (title, discount, startdate, enddate, bookid, branchid)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING promotionid""",
            body.title, body.discount, start, end, body.bookid, body.branchid,
        )
        return {"promotionid": row["promotionid"], "message": "Акцію створено"}


@router.delete("/{promo_id}", dependencies=[Depends(require_admin)])
async def delete_promotion(promo_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM promotions WHERE promotionid = $1", promo_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Акцію не знайдено")
        return {"message": "Акцію видалено"}
