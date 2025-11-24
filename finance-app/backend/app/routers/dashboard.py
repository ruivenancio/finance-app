from datetime import datetime
from fastapi import APIRouter, Depends
from ..database import prisma
from ..dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
async def get_dashboard_summary(user=Depends(get_current_user)):
    # Get current month range
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    
    # Fetch accounts
    accounts = await prisma.account.find_many(where={"userId": user.id})
    total_balance = sum(acc.balance for acc in accounts)
    
    # Fetch transactions for current month
    monthly_transactions = await prisma.transaction.find_many(
        where={
            "userId": user.id,
            "date": {
                "gte": start_of_month
            }
        },
        include={"category": True}
    )
    
    # Calculate monthly stats
    monthly_expenses = sum(t.amount for t in monthly_transactions if t.category and t.category.type == "EXPENSE")
    monthly_income = sum(t.amount for t in monthly_transactions if t.category and t.category.type == "INCOME")
    
    # Fetch budgets
    budgets = await prisma.budget.find_many(where={"userId": user.id, "year": now.year})
    total_budget = sum(b.amount for b in budgets)
    
    # Recent transactions
    recent_transactions = await prisma.transaction.find_many(
        where={"userId": user.id},
        take=5,
        order={"date": "desc"},
        include={"category": True}
    )
    
    # Monthly Stats for Chart
    start_of_year = datetime(now.year, 1, 1)
    yearly_transactions = await prisma.transaction.find_many(
        where={
            "userId": user.id,
            "date": {
                "gte": start_of_year
            }
        },
        include={"category": True}
    )

    monthly_stats = []
    for i in range(1, 13):
        month_name = datetime(now.year, i, 1).strftime("%b")
        month_txs = [t for t in yearly_transactions if t.date.month == i]
        income = sum(t.amount for t in month_txs if t.category and t.category.type == "INCOME")
        expenses = sum(abs(t.amount) for t in month_txs if t.category and t.category.type == "EXPENSE")
        monthly_stats.append({
            "month": month_name,
            "income": income,
            "expenses": expenses
        })

    return {
        "totalBalance": total_balance,
        "accountCount": len(accounts),
        "monthlyExpenses": monthly_expenses,
        "monthlyIncome": monthly_income,
        "totalBudget": total_budget,
        "recentTransactions": recent_transactions,
        "monthlyStats": monthly_stats
    }
