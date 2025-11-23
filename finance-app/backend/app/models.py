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

    class Config:
        orm_mode = True
