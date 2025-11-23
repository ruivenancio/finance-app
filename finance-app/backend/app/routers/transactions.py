from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from ..database import prisma
from ..models import TransactionCreate, TransactionResponse
from ..dependencies import get_current_user
import pandas as pd
from io import BytesIO

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(user=Depends(get_current_user)):
    return await prisma.transaction.find_many(
        where={"userId": user.id},
        order={"date": "desc"}
    )

@router.post("/", response_model=TransactionResponse)
async def create_transaction(transaction: TransactionCreate, user=Depends(get_current_user)):
    # Update account balance
    account = await prisma.account.find_unique(where={"id": transaction.accountId})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Simple logic: expense subtracts, income adds. 
    # Assuming transaction amount is positive and type determines sign, or amount is signed.
    # For now, let's assume amount is signed or we handle it in frontend. 
    # Let's just update balance with the amount.
    new_balance = account.balance + transaction.amount
    await prisma.account.update(
        where={"id": transaction.accountId},
        data={"balance": new_balance}
    )

    return await prisma.transaction.create(
        data={
            "date": transaction.date,
            "amount": transaction.amount,
            "description": transaction.description,
            "categoryId": transaction.categoryId,
            "accountId": transaction.accountId,
            "userId": user.id
        }
    )

@router.post("/import")
async def import_transactions(file: UploadFile = File(...), account_id: str = "", user=Depends(get_current_user)):
    if not account_id:
         raise HTTPException(status_code=400, detail="Account ID required")
    
    contents = await file.read()
    df = pd.read_excel(BytesIO(contents))
    
    # Expected columns: Date, Description, Amount
    # This is a basic implementation
    count = 0
    for _, row in df.iterrows():
        try:
            await prisma.transaction.create(
                data={
                    "date": row['Date'],
                    "amount": float(row['Amount']),
                    "description": row['Description'],
                    "accountId": account_id,
                    "userId": user.id
                }
            )
            count += 1
        except Exception as e:
            print(f"Error importing row: {e}")
            continue
            
    return {"message": f"Imported {count} transactions"}
