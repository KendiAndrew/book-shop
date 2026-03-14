from fastapi import APIRouter, Depends
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", dependencies=[Depends(require_admin)])
async def dashboard():
    pool = await get_pool()
    async with pool.acquire() as conn:
        total_books = await conn.fetchval("SELECT COUNT(*) FROM books")
        total_clients = await conn.fetchval("SELECT COUNT(*) FROM clients")
        total_orders = await conn.fetchval("SELECT COUNT(*) FROM orders")
        revenue = await conn.fetchval(
            "SELECT COALESCE(SUM(od.quantity * od.unitprice), 0) FROM orderdetails od"
        )
        return {
            "total_books": total_books,
            "total_clients": total_clients,
            "total_orders": total_orders,
            "total_revenue": float(revenue),
        }


@router.get("/author-popularity", dependencies=[Depends(require_admin)])
async def author_popularity():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM authorpopularity ORDER BY totalsales DESC")
        return [dict(r) for r in rows]


@router.get("/sales-trend", dependencies=[Depends(require_admin)])
async def sales_trend():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM booksalestrend ORDER BY salemonth DESC LIMIT 50")
        return [dict(r) for r in rows]


@router.get("/branch-report", dependencies=[Depends(require_admin)])
async def branch_report():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM branchsalesreport ORDER BY totalrevenue DESC")
        return [dict(r) for r in rows]


@router.get("/sales-dynamics/{book_id}", dependencies=[Depends(require_admin)])
async def sales_dynamics(book_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM calculate_sales_dynamics($1)", book_id)
        return dict(row) if row else {}
