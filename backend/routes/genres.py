from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_pool
from auth.security import require_admin

router = APIRouter(prefix="/api/genres", tags=["Genres"])


class GenreBody(BaseModel):
    genrename: str


@router.get("")
async def get_genres():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM genres ORDER BY genrename")
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_genre(body: GenreBody):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO genres (genrename) VALUES ($1) RETURNING genreid", body.genrename
        )
        return {"genreid": row["genreid"], "message": "Жанр створено"}


@router.put("/{genre_id}", dependencies=[Depends(require_admin)])
async def update_genre(genre_id: int, body: GenreBody):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE genres SET genrename=$1 WHERE genreid=$2", body.genrename, genre_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Жанр не знайдено")
        return {"message": "Жанр оновлено"}


@router.delete("/{genre_id}", dependencies=[Depends(require_admin)])
async def delete_genre(genre_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM genres WHERE genreid = $1", genre_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Жанр не знайдено")
        return {"message": "Жанр видалено"}
