from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..database import prisma
from ..models import AccountCreate, AccountResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(user=Depends(get_current_user)):
    return await prisma.account.find_many(where={"userId": user.id})

@router.post("/", response_model=AccountResponse)
async def create_account(account: AccountCreate, user=Depends(get_current_user)):
    return await prisma.account.create(
        data={
            "name": account.name,
            "type": account.type,
            "balance": account.balance,
            "userId": user.id
        }
    )

@router.delete("/{account_id}")
async def delete_account(account_id: str, user=Depends(get_current_user)):
    account = await prisma.account.find_first(where={"id": account_id, "userId": user.id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    await prisma.account.delete(where={"id": account_id})
    return {"message": "Account deleted"}
