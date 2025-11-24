from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from ..database import prisma
from ..models import TransactionCreate, TransactionResponse, TransactionUpdate, TransferRequest
from ..dependencies import get_current_user
import pandas as pd
from io import BytesIO

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/transfer")
async def transfer_funds(transfer: TransferRequest, user=Depends(get_current_user)):
    # Verify accounts
    from_account = await prisma.account.find_unique(where={"id": transfer.fromAccountId})
    to_account = await prisma.account.find_unique(where={"id": transfer.toAccountId})

    if not from_account or from_account.userId != user.id:
        raise HTTPException(status_code=404, detail="Source account not found")
    if not to_account or to_account.userId != user.id:
        raise HTTPException(status_code=404, detail="Destination account not found")

    # Update balances
    await prisma.account.update(
        where={"id": transfer.fromAccountId},
        data={"balance": from_account.balance - transfer.amount}
    )
    await prisma.account.update(
        where={"id": transfer.toAccountId},
        data={"balance": to_account.balance + transfer.amount}
    )

    # Create transactions
    # 1. Expense from source
    await prisma.transaction.create(
        data={
            "date": transfer.date,
            "amount": -transfer.amount,
            "description": f"Transfer to {to_account.name}: {transfer.description}",
            "accountId": transfer.fromAccountId,
            "userId": user.id
        }
    )

    # 2. Income to destination
    await prisma.transaction.create(
        data={
            "date": transfer.date,
            "amount": transfer.amount,
            "description": f"Transfer from {from_account.name}: {transfer.description}",
            "accountId": transfer.toAccountId,
            "userId": user.id
        }
    )

    return {"message": "Transfer successful"}

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(user=Depends(get_current_user)):
    return await prisma.transaction.find_many(
        where={"userId": user.id},
        order={"date": "desc"},
        include={"category": True}
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

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, user=Depends(get_current_user)):
    transaction = await prisma.transaction.find_first(where={"id": transaction_id, "userId": user.id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Revert account balance
    account = await prisma.account.find_unique(where={"id": transaction.accountId})
    if account:
        new_balance = account.balance - transaction.amount
        await prisma.account.update(
            where={"id": transaction.accountId},
            data={"balance": new_balance}
        )
    
    await prisma.transaction.delete(where={"id": transaction_id})
    return {"message": "Transaction deleted"}

@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: str, transaction: TransactionUpdate, user=Depends(get_current_user)):
    existing_transaction = await prisma.transaction.find_first(where={"id": transaction_id, "userId": user.id})
    if not existing_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Handle balance update if amount changed
    if transaction.amount is not None and transaction.amount != existing_transaction.amount:
        account = await prisma.account.find_unique(where={"id": existing_transaction.accountId})
        if account:
            # Revert old amount and add new amount
            # new_balance = current - old + new
            new_balance = account.balance - existing_transaction.amount + transaction.amount
            await prisma.account.update(
                where={"id": existing_transaction.accountId},
                data={"balance": new_balance}
            )

    update_data = transaction.dict(exclude_unset=True)
    return await prisma.transaction.update(
        where={"id": transaction_id},
        data=update_data
    )
