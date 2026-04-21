import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_conn
from auth.security import require_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])


class OrderCreate(BaseModel):
    branchid: int
    items: list[dict]  # [{"bookid": 1, "quantity": 2}, ...]
    paymentmethod: str = "Карта"  # "Готівка" or "Карта"
    cash_amount: Optional[float] = None


class OrderItemCreate(BaseModel):
    bookid: int
    quantity: int


@router.get("")
async def get_orders(user: dict = Depends(require_user)):
    async with get_conn(user["role"]) as conn:
        if user["role"] == "admin":
            rows = await conn.fetch(
                """SELECT o.orderid, o.orderdate, o.branchid,
                          c.firstname || ' ' || c.lastname AS client,
                          br.city || ', ' || br.address AS branch,
                          COALESCE(SUM(od.quantity * od.unitprice), 0) AS total
                   FROM orders o
                   JOIN clients c ON o.clientid = c.clientid
                   JOIN branches br ON o.branchid = br.branchid
                   LEFT JOIN orderdetails od ON o.orderid = od.orderid
                   GROUP BY o.orderid, o.orderdate, o.branchid, c.firstname, c.lastname, br.city, br.address
                   ORDER BY o.orderdate DESC"""
            )
        else:
            client_id = user.get("clientid")
            if not client_id:
                return []
            rows = await conn.fetch(
                """SELECT o.orderid, o.orderdate, o.branchid,
                          br.city || ', ' || br.address AS branch,
                          COALESCE(SUM(od.quantity * od.unitprice), 0) AS total
                   FROM orders o
                   JOIN branches br ON o.branchid = br.branchid
                   LEFT JOIN orderdetails od ON o.orderid = od.orderid
                   WHERE o.clientid = $1
                   GROUP BY o.orderid, o.orderdate, o.branchid, br.city, br.address
                   ORDER BY o.orderdate DESC""",
                client_id,
            )
        return [dict(r) for r in rows]


@router.get("/{order_id}")
async def get_order(order_id: int, user: dict = Depends(require_user)):
    async with get_conn(user["role"]) as conn:
        order = await conn.fetchrow(
            """SELECT o.*, c.firstname || ' ' || c.lastname AS client,
                      br.city || ', ' || br.address AS branch
               FROM orders o
               JOIN clients c ON o.clientid = c.clientid
               JOIN branches br ON o.branchid = br.branchid
               WHERE o.orderid = $1""",
            order_id,
        )
        if not order:
            raise HTTPException(status_code=404, detail="Замовлення не знайдено")

        if user["role"] != "admin" and order["clientid"] != user.get("clientid"):
            raise HTTPException(status_code=403, detail="Немає доступу")

        details = await conn.fetch(
            """SELECT od.*, b.title
               FROM orderdetails od
               JOIN books b ON od.bookid = b.bookid
               WHERE od.orderid = $1""",
            order_id,
        )

        return {**dict(order), "items": [dict(d) for d in details]}


@router.post("")
async def create_order(body: OrderCreate, user: dict = Depends(require_user)):
    client_id = user.get("clientid")
    if not client_id:
        raise HTTPException(status_code=400, detail="Користувач не прив'язаний до клієнта")

    items_json = json.dumps(
        [{"bookid": item["bookid"], "quantity": item["quantity"]} for item in body.items]
    )

    async with get_conn(user["role"]) as conn:
        try:
            await conn.execute(
                "CALL place_order($1, $2, $3::json, $4, $5)",
                client_id,
                body.branchid,
                items_json,
                body.paymentmethod,
                body.cash_amount,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    return {"message": "Замовлення створено"}
