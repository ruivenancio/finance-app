from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum

class AccountType(str, Enum):
    BANK = "BANK"
    STOCK = "STOCK"
    CARD = "CARD"

class CategoryType(str, Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"

# User Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    createdAt: datetime

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Category Models
class CategoryCreate(BaseModel):
    name: str
    type: str # INCOME, EXPENSE
    parentId: Optional[str] = None

class CategoryResponse(CategoryCreate):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True

# Account Models
class AccountCreate(BaseModel):
    name: str
    type: AccountType
    balance: float

class AccountResponse(AccountCreate):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True

# Transaction Models
class TransactionCreate(BaseModel):
    date: datetime
    amount: float
    description: str
    categoryId: Optional[str] = None
    accountId: str

class TransactionResponse(TransactionCreate):
    id: str
    userId: str
    createdAt: datetime
    updatedAt: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        orm_mode = True

# Update Models
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    parentId: Optional[str] = None

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[AccountType] = None
    balance: Optional[float] = None

class TransactionUpdate(BaseModel):
    date: Optional[datetime] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    categoryId: Optional[str] = None
    accountId: Optional[str] = None

class TransferRequest(BaseModel):
    fromAccountId: str
    toAccountId: str
    amount: float
    date: datetime
    date: datetime
    description: str

# Stock Models
class StockCreate(BaseModel):
    symbol: str
    quantity: float
    averagePrice: float
    accountId: str

class StockResponse(StockCreate):
    id: str
    userId: str
    currentPrice: Optional[float] = None
    account: Optional[AccountResponse] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True

class StockTransactionCreate(BaseModel):
    type: str # BUY, SELL, DIVIDEND
    quantity: Optional[float] = None
    price: Optional[float] = None
    amount: float
    date: datetime

class StockTransactionResponse(StockTransactionCreate):
    id: str
    stockId: str
    userId: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        orm_mode = True
