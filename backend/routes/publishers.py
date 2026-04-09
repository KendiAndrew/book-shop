from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_conn
from auth.security import require_admin

router = APIRouter(prefix="/api/publishers", tags=["Publishers"])


class PublisherBody(BaseModel):
    publishername: str
    country: str


@router.get("")
async def get_publishers():
    async with get_conn("guest") as conn:
        rows = await conn.fetch("SELECT * FROM publishers ORDER BY publishername")
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_publisher(body: PublisherBody):
    async with get_conn("admin") as conn:
        row = await conn.fetchrow(
            "INSERT INTO publishers (publishername, country) VALUES ($1,$2) RETURNING publisherid",
            body.publishername, body.country,
        )
        return {"publisherid": row["publisherid"], "message": "Видавництво створено"}


@router.put("/{pub_id}", dependencies=[Depends(require_admin)])
async def update_publisher(pub_id: int, body: PublisherBody):
    async with get_conn("admin") as conn:
        result = await conn.execute(
            "UPDATE publishers SET publishername=$1, country=$2 WHERE publisherid=$3",
            body.publishername, body.country, pub_id,
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Видавництво не знайдено")
        return {"message": "Видавництво оновлено"}


@router.delete("/{pub_id}", dependencies=[Depends(require_admin)])
async def delete_publisher(pub_id: int):
    async with get_conn("admin") as conn:
        result = await conn.execute("DELETE FROM publishers WHERE publisherid = $1", pub_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Видавництво не знайдено")
        return {"message": "Видавництво видалено"}
