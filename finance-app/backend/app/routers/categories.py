from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..database import prisma
from ..models import CategoryCreate, CategoryResponse, CategoryUpdate
from ..dependencies import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(user=Depends(get_current_user)):
    return await prisma.category.find_many(where={"userId": user.id})

@router.post("/", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, user=Depends(get_current_user)):
    return await prisma.category.create(
        data={
            "name": category.name,
            "type": category.type,
            "parentId": category.parentId,
            "userId": user.id
        }
    )

@router.delete("/{category_id}")
async def delete_category(category_id: str, user=Depends(get_current_user)):
    category = await prisma.category.find_first(where={"id": category_id, "userId": user.id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await prisma.category.delete(where={"id": category_id})
    return {"message": "Category deleted"}

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(category_id: str, category: CategoryUpdate, user=Depends(get_current_user)):
    existing_category = await prisma.category.find_first(where={"id": category_id, "userId": user.id})
    if not existing_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category.dict(exclude_unset=True)
    return await prisma.category.update(
        where={"id": category_id},
        data=update_data
    )
