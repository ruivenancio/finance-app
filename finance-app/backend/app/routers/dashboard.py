from fastapi import APIRouter, Depends
from ..database import prisma
from ..dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_dashboard_summary(user=Depends(get_current_user)):
    accounts = await prisma.account.find_many(where={"userId": user.id})
    total_balance = sum(acc.balance for acc in accounts)
    
    recent_transactions = await prisma.transaction.find_many(
        where={"userId": user.id},
        take=5,
        order={"date": "desc"},
        include={"category": True}
    )
    
    return {
        "totalBalance": total_balance,
        "accountCount": len(accounts),
        "recentTransactions": recent_transactions
    }
