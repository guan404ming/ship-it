# Buffett 04/24
from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from models import *


# Order Item Schema
class OrderItemCreateSchema(BaseModel):
    product_id: int
    model_id: int
    quantity: int
    sold_price: Decimal
    total_price: Decimal


class UpdateOrderItemSchema(BaseModel):
    quantity: Optional[int] = None
    returned_quantity: Optional[int] = None
    sold_price: Optional[Decimal] = None
    total_price: Optional[Decimal] = None

    class Config:
        orm_mode = True



# Order Schema
class CreateOrderSchema(BaseModel):
    buyer_id: int
    product_total_price: Decimal
    shipping_fee: Decimal
    total_paid: Decimal
    order_status: OrderStatus
    order_items: List[OrderItemCreateSchema]

    class Config:
        orm_mode = True # Enable ORM compatibility


class UpdateOrderSchema(BaseModel):
    order_status: Optional[OrderStatus] = None
    product_total_price: Optional[Decimal] = None
    shipping_fee: Optional[Decimal] = None
    total_paid: Optional[Decimal] = None
    cancel_reason: Optional[str] = None
    return_refund_status: Optional[str] = None
    payment_time: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        

class DeleteOrderSchema(BaseModel):
    order_id: str

    class Config:
        orm_mode = True


# Purchase Batch Schema
class UpdatePurchaseBatchSchema(BaseModel):
    status: Optional[str] = None  # draft / confirmed
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class CreatePurchaseBatchSchema(BaseModel):
    supplier_id: int
    status: str  # draft / confirmed

    class Config:
        orm_mode = True


# Product Schema
class CreateProductSchema(BaseModel):
    product_name: str
    category_id: int
    listed_date: datetime
    status: str  # active, inactive, out-of-stock

    class Config:
        orm_mode = True
            

class UpdateProductSchema(BaseModel):
    product_name: Optional[str] = None
    status: Optional[str] = None  # active, inactive, out-of-stock
    category_id: Optional[int] = None

    class Config:
        orm_mode = True


class DeleteProductSchema(BaseModel):
    product_id: int

    class Config:
        orm_mode = True
        
        

# Product Model Schema
class CreateProductModelSchema(BaseModel):
    product_id: int
    model_name: str
    sku: str
    original_price: Decimal
    promo_price: Decimal

    class Config:
        orm_mode = True

class UpdateProductModelSchema(BaseModel):
    model_name: Optional[str] = None
    sku: Optional[str] = None
    original_price: Optional[Decimal] = None
    promo_price: Optional[Decimal] = None

    class Config:
        orm_mode = True
    
class DeleteProductModelSchema(BaseModel):
    model_id: int

    class Config:
        orm_mode = True



# Category Schema
class CreateCategorySchema(BaseModel):
    category_name: str
    parent_id: Optional[int] = None

class UpdateCategorySchema(BaseModel):
    category_name: Optional[str] = None
    parent_id: Optional[int] = None  # If updating parent category

    class Config:
        orm_mode = True
    
class DeleteCategorySchema(BaseModel):
    category_id: int

    class Config:
        orm_mode = True
        


# Supplier Schema
class CreateSupplierSchema(BaseModel):
    supplier_name: str
    contact_info: str

    class Config:
        orm_mode = True
        
class UpdateSupplierSchema(BaseModel):
    supplier_name: Optional[str] = None
    contact_info: Optional[str] = None

    class Config:
        orm_mode = True

class DeleteSupplierSchema(BaseModel):
    supplier_id: int

    class Config:
        orm_mode = True
        



# Inventory Movement Schema
class UpdateInventoryMovementSchema(BaseModel):
    movement_type: Optional[str] = None  # purchase / outbound / return / adjust
    quantity: Optional[int] = None
    order_id: Optional[str] = None
    note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        