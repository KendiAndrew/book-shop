from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_conn
from auth.security import require_admin

router = APIRouter(prefix="/api/authors", tags=["Authors"])


class AuthorCreate(BaseModel):
    firstname: str
    lastname: str
    biography: Optional[str] = None


@router.get("")
async def get_authors():
    async with get_conn("guest") as conn:
        rows = await conn.fetch("SELECT * FROM authors ORDER BY lastname, firstname")
        return [dict(r) for r in rows]


@router.get("/{author_id}")
async def get_author(author_id: int):
    async with get_conn("guest") as conn:
        row = await conn.fetchrow("SELECT * FROM authors WHERE authorid = $1", author_id)
        if not row:
            raise HTTPException(status_code=404, detail="Автора не знайдено")
        return dict(row)


@router.post("", dependencies=[Depends(require_admin)])
async def create_author(body: AuthorCreate):
    async with get_conn("admin") as conn:
        row = await conn.fetchrow(
            "INSERT INTO authors (firstname, lastname, biography) VALUES ($1,$2,$3) RETURNING authorid",
            body.firstname, body.lastname, body.biography,
        )
        return {"authorid": row["authorid"], "message": "Автора створено"}


@router.put("/{author_id}", dependencies=[Depends(require_admin)])
async def update_author(author_id: int, body: AuthorCreate):
    async with get_conn("admin") as conn:
        result = await conn.execute(
            "UPDATE authors SET firstname=$1, lastname=$2, biography=$3 WHERE authorid=$4",
            body.firstname, body.lastname, body.biography, author_id,
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Автора не знайдено")
        return {"message": "Автора оновлено"}


@router.delete("/{author_id}", dependencies=[Depends(require_admin)])
async def delete_author(author_id: int):
    async with get_conn("admin") as conn:
        result = await conn.execute("DELETE FROM authors WHERE authorid = $1", author_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Автора не знайдено")
        return {"message": "Автора видалено"}
