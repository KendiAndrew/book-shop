from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from database import get_conn
from auth.security import require_admin

router = APIRouter(prefix="/api/languages", tags=["Languages"])


class LanguageBody(BaseModel):
    languagename: str


@router.get("")
async def get_languages():
    async with get_conn("guest") as conn:
        rows = await conn.fetch("SELECT * FROM languages ORDER BY languagename")
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_language(body: LanguageBody):
    async with get_conn("admin") as conn:
        row = await conn.fetchrow(
            "INSERT INTO languages (languagename) VALUES ($1) RETURNING languageid",
            body.languagename,
        )
        return {"languageid": row["languageid"], "message": "Мову створено"}


@router.delete("/{lang_id}", dependencies=[Depends(require_admin)])
async def delete_language(lang_id: int):
    async with get_conn("admin") as conn:
        result = await conn.execute("DELETE FROM languages WHERE languageid = $1", lang_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Мову не знайдено")
        return {"message": "Мову видалено"}
