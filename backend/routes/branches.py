from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from database import get_conn
from auth.security import require_admin

router = APIRouter(prefix="/api/branches", tags=["Branches"])


class BranchBody(BaseModel):
    city: str
    address: str
    postcode: str
    managerid: Optional[int] = None


@router.get("")
async def get_branches():
    async with get_conn("admin") as conn:
        rows = await conn.fetch(
            """SELECT br.*,
                      e.firstname || ' ' || e.lastname AS manager
               FROM branches br
               LEFT JOIN employees e ON br.managerid = e.employeeid
               ORDER BY br.city"""
        )
        return [dict(r) for r in rows]


@router.post("", dependencies=[Depends(require_admin)])
async def create_branch(body: BranchBody):
    async with get_conn("admin") as conn:
        row = await conn.fetchrow(
            "INSERT INTO branches (city, address, postcode, managerid) VALUES ($1,$2,$3,$4) RETURNING branchid",
            body.city, body.address, body.postcode, body.managerid,
        )
        return {"branchid": row["branchid"], "message": "Філію створено"}


@router.put("/{branch_id}", dependencies=[Depends(require_admin)])
async def update_branch(branch_id: int, body: BranchBody):
    async with get_conn("admin") as conn:
        result = await conn.execute(
            "UPDATE branches SET city=$1, address=$2, postcode=$3, managerid=$4 WHERE branchid=$5",
            body.city, body.address, body.postcode, body.managerid, branch_id,
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Філію не знайдено")
        return {"message": "Філію оновлено"}


@router.delete("/{branch_id}", dependencies=[Depends(require_admin)])
async def delete_branch(branch_id: int):
    async with get_conn("admin") as conn:
        result = await conn.execute("DELETE FROM branches WHERE branchid = $1", branch_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Філію не знайдено")
        return {"message": "Філію видалено"}
