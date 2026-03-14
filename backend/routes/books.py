from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/books", tags=["Books"])


class BookCreate(BaseModel):
    title: str
    authorid: int
    genreid: int
    publisherid: int
    format: str
    quantity: int = 0
    price: float
    supplierid: Optional[int] = None
    publicationyear: int
    languageid: int
    pagecount: int
    cover_url: Optional[str] = None


class BookUpdate(BaseModel):
    title: Optional[str] = None
    authorid: Optional[int] = None
    genreid: Optional[int] = None
    publisherid: Optional[int] = None
    format: Optional[str] = None
    quantity: Optional[int] = None
    price: Optional[float] = None
    supplierid: Optional[int] = None
    publicationyear: Optional[int] = None
    languageid: Optional[int] = None
    pagecount: Optional[int] = None
    cover_url: Optional[str] = None


@router.get("")
async def get_books(
    search: Optional[str] = None,
    genreid: Optional[int] = None,
    authorid: Optional[int] = None,
    languageid: Optional[int] = None,
    format: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "title",
    order: str = "asc",
    page: int = 1,
    limit: int = 20,
):
    pool = await get_pool()
    async with pool.acquire() as conn:
        conditions = []
        params = []
        idx = 1

        if search:
            conditions.append(f"(b.title ILIKE ${idx} OR a.firstname || ' ' || a.lastname ILIKE ${idx})")
            params.append(f"%{search}%")
            idx += 1
        if genreid:
            conditions.append(f"b.genreid = ${idx}")
            params.append(genreid)
            idx += 1
        if authorid:
            conditions.append(f"b.authorid = ${idx}")
            params.append(authorid)
            idx += 1
        if languageid:
            conditions.append(f"b.languageid = ${idx}")
            params.append(languageid)
            idx += 1
        if format:
            conditions.append(f"b.format = ${idx}")
            params.append(format)
            idx += 1
        if min_price is not None:
            conditions.append(f"b.price >= ${idx}")
            params.append(min_price)
            idx += 1
        if max_price is not None:
            conditions.append(f"b.price <= ${idx}")
            params.append(max_price)
            idx += 1

        where = "WHERE " + " AND ".join(conditions) if conditions else ""

        allowed_sorts = {"title": "b.title", "price": "b.price", "publicationyear": "b.publicationyear", "created_at": "b.created_at"}
        sort_col = allowed_sorts.get(sort, "b.title")
        sort_order = "DESC" if order.lower() == "desc" else "ASC"

        offset = (page - 1) * limit

        count = await conn.fetchval(
            f"""SELECT COUNT(*) FROM books b
                JOIN authors a ON b.authorid = a.authorid
                {where}""",
            *params,
        )

        rows = await conn.fetch(
            f"""SELECT b.bookid, b.title, b.format, b.quantity, b.price, b.publicationyear, b.pagecount, b.cover_url,
                       a.firstname || ' ' || a.lastname AS author, a.authorid,
                       g.genrename AS genre, g.genreid,
                       p.publishername AS publisher,
                       l.languagename AS language
                FROM books b
                JOIN authors a ON b.authorid = a.authorid
                JOIN genres g ON b.genreid = g.genreid
                JOIN publishers p ON b.publisherid = p.publisherid
                JOIN languages l ON b.languageid = l.languageid
                {where}
                ORDER BY {sort_col} {sort_order}
                LIMIT ${idx} OFFSET ${idx + 1}""",
            *params, limit, offset,
        )

        return {
            "items": [dict(r) for r in rows],
            "total": count,
            "page": page,
            "pages": max(1, -(-count // limit)),
        }


@router.get("/{book_id}")
async def get_book(book_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """SELECT b.*, a.firstname || ' ' || a.lastname AS author,
                      g.genrename AS genre, p.publishername AS publisher,
                      l.languagename AS language
               FROM books b
               JOIN authors a ON b.authorid = a.authorid
               JOIN genres g ON b.genreid = g.genreid
               JOIN publishers p ON b.publisherid = p.publisherid
               JOIN languages l ON b.languageid = l.languageid
               WHERE b.bookid = $1""",
            book_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Книгу не знайдено")
        return dict(row)


@router.post("", dependencies=[Depends(require_admin)])
async def create_book(body: BookCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """INSERT INTO books (title, authorid, genreid, publisherid, format, quantity, price,
                                  supplierid, publicationyear, languageid, pagecount, cover_url)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING bookid""",
            body.title, body.authorid, body.genreid, body.publisherid, body.format,
            body.quantity, body.price, body.supplierid, body.publicationyear,
            body.languageid, body.pagecount, body.cover_url,
        )
        return {"bookid": row["bookid"], "message": "Книгу створено"}


@router.put("/{book_id}", dependencies=[Depends(require_admin)])
async def update_book(book_id: int, body: BookUpdate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchval("SELECT 1 FROM books WHERE bookid = $1", book_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Книгу не знайдено")

        fields = []
        params = []
        idx = 1
        for field, value in body.model_dump(exclude_none=True).items():
            fields.append(f"{field} = ${idx}")
            params.append(value)
            idx += 1

        if not fields:
            raise HTTPException(status_code=400, detail="Немає полів для оновлення")

        params.append(book_id)
        await conn.execute(
            f"UPDATE books SET {', '.join(fields)} WHERE bookid = ${idx}",
            *params,
        )
        return {"message": "Книгу оновлено"}


@router.delete("/{book_id}", dependencies=[Depends(require_admin)])
async def delete_book(book_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM books WHERE bookid = $1", book_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Книгу не знайдено")
        return {"message": "Книгу видалено"}
