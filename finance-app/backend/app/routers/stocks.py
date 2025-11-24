from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..database import prisma
from ..models import StockCreate, StockResponse, StockTransactionCreate, StockTransactionResponse
from ..dependencies import get_current_user
import yfinance as yf

router = APIRouter(prefix="/stocks", tags=["stocks"])

@router.get("/", response_model=List[StockResponse])
async def get_stocks(user=Depends(get_current_user)):
    return await prisma.stock.find_many(
        where={"userId": user.id},
        include={"account": True}
    )

@router.post("/", response_model=StockResponse)
async def create_stock(stock: StockCreate, user=Depends(get_current_user)):
    account = await prisma.account.find_unique(where={"id": stock.accountId})
    if not account or account.userId != user.id:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # Initial fetch of current price
    try:
        ticker = yf.Ticker(stock.symbol)
        current_price = ticker.fast_info.last_price
    except Exception:
        current_price = None

    return await prisma.stock.create(
        data={
            "symbol": stock.symbol,
            "quantity": stock.quantity,
            "averagePrice": stock.averagePrice,
            "currentPrice": current_price,
            "accountId": stock.accountId,
            "userId": user.id
        }
    )

@router.post("/sync")
async def sync_stocks(user=Depends(get_current_user)):
    stocks = await prisma.stock.find_many(where={"userId": user.id})
    updated_count = 0
    
    for stock in stocks:
        try:
            ticker = yf.Ticker(stock.symbol)
            current_price = ticker.fast_info.last_price
            
            if current_price:
                await prisma.stock.update(
                    where={"id": stock.id},
                    data={"currentPrice": current_price}
                )
                updated_count += 1
        except Exception as e:
            print(f"Failed to update stock {stock.symbol}: {e}")
            continue
            
    return {"message": f"Synced {updated_count} stocks"}

    await prisma.stock.delete(where={"id": stock_id})
    return {"message": "Stock deleted"}

@router.get("/{stock_id}", response_model=StockResponse)
async def get_stock_details(stock_id: str, user=Depends(get_current_user)):
    stock = await prisma.stock.find_first(
        where={"id": stock_id, "userId": user.id},
        include={"account": True}
    )
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return stock

@router.get("/{stock_id}/transactions", response_model=List[StockTransactionResponse])
async def get_stock_transactions(stock_id: str, user=Depends(get_current_user)):
    return await prisma.stocktransaction.find_many(
        where={"stockId": stock_id, "userId": user.id},
        order={"date": "desc"}
    )

@router.post("/{stock_id}/transactions", response_model=StockTransactionResponse)
async def create_stock_transaction(
    stock_id: str, 
    transaction: StockTransactionCreate, 
    user=Depends(get_current_user)
):
    stock = await prisma.stock.find_first(
        where={"id": stock_id, "userId": user.id},
        include={"account": True}
    )
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # 1. Create Stock Transaction
    stock_tx = await prisma.stocktransaction.create(
        data={
            "type": transaction.type,
            "quantity": transaction.quantity,
            "price": transaction.price,
            "amount": transaction.amount,
            "date": transaction.date,
            "stockId": stock_id,
            "userId": user.id
        }
    )

    # 2. Update Stock Quantity & Avg Price
    new_quantity = stock.quantity
    new_avg_price = stock.averagePrice

    if transaction.type == "BUY":
        total_cost = (stock.quantity * stock.averagePrice) + transaction.amount
        new_quantity = stock.quantity + transaction.quantity
        if new_quantity > 0:
            new_avg_price = total_cost / new_quantity
        
        # Deduct from Account
        await prisma.account.update(
            where={"id": stock.accountId},
            data={"balance": {"decrement": transaction.amount}}
        )
        
        # Create Expense Transaction
        await prisma.transaction.create(
            data={
                "date": transaction.date,
                "amount": -transaction.amount,
                "description": f"Buy {stock.symbol} ({transaction.quantity} shares)",
                "accountId": stock.accountId,
                "userId": user.id,
                "categoryId": None # Optional: could link to an 'Investment' category if exists
            }
        )

    elif transaction.type == "SELL":
        new_quantity = stock.quantity - transaction.quantity
        # Avg price doesn't change on sell, only realized gain/loss happens
        
        # Add to Account
        await prisma.account.update(
            where={"id": stock.accountId},
            data={"balance": {"increment": transaction.amount}}
        )

        # Create Income Transaction
        await prisma.transaction.create(
            data={
                "date": transaction.date,
                "amount": transaction.amount,
                "description": f"Sell {stock.symbol} ({transaction.quantity} shares)",
                "accountId": stock.accountId,
                "userId": user.id,
                "categoryId": None
            }
        )

    elif transaction.type == "DIVIDEND":
        # Add to Account
        await prisma.account.update(
            where={"id": stock.accountId},
            data={"balance": {"increment": transaction.amount}}
        )

        # Create Income Transaction
        await prisma.transaction.create(
            data={
                "date": transaction.date,
                "amount": transaction.amount,
                "description": f"Dividend {stock.symbol}",
                "accountId": stock.accountId,
                "userId": user.id,
                "categoryId": None
            }
        )

    # Update Stock
    await prisma.stock.update(
        where={"id": stock_id},
        data={
            "quantity": new_quantity,
            "averagePrice": new_avg_price
        }
    )

    return stock_tx
