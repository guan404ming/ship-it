# Buffett 04/24
from datetime import datetime, UTC
from enum import Enum
from decimal import Decimal
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel


class OrderStatus(str, Enum):
    PENDING = "pending"  # 訂單剛成立，尚未處理
    SHIPPED = "shipped"  # 已出貨
    DELIVERED = "delivered"  # 已送達
    CONFIRMED = "confirmed"  # 已成立（買家已付款）
    CONFIRMED_IN_TRIAL = "confirmed_in_trial"  # 已成立（鑑賞期內）
    CANCELED = "canceled"  # 不成立


class Supplier(SQLModel, table=True):
    supplier_id: int = Field(default=None, primary_key=True)
    supplier_name: str
    contact_info: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    purchase_batches: list["PurchaseBatch"] = Relationship(back_populates="supplier")


class Buyer(SQLModel, table=True):
    buyer_id: int = Field(default=None, primary_key=True)
    buyer_account: str
    orders: list["Order"] = Relationship(back_populates="buyer")


class PurchaseBatch(SQLModel, table=True):
    batch_id: int = Field(default=None, primary_key=True)
    supplier_id: int = Field(foreign_key="supplier.supplier_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    status: str  # draft / confirmed
    supplier: Supplier = Relationship(back_populates="purchase_batches")
    purchase_items: list["PurchaseItem"] = Relationship(back_populates="batch")


class PurchaseItem(SQLModel, table=True):
    item_id: int = Field(default=None, primary_key=True)
    batch_id: int = Field(foreign_key="purchasebatch.batch_id")
    model_id: int = Field(foreign_key="productmodel.model_id")
    quantity: int
    unit_cost: Decimal
    batch: PurchaseBatch = Relationship(back_populates="purchase_items")
    product_model: "ProductModel" = Relationship(back_populates="purchase_items")


class Category(SQLModel, table=True):
    category_id: int = Field(default=None, primary_key=True)
    category_name: str
    parent_id: Optional[int] = Field(default=None, foreign_key="category.category_id")
    parent: Optional["Category"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Category.category_id"}
    )
    children: list["Category"] = Relationship(back_populates="parent")
    products: list["Product"] = Relationship(back_populates="category")


class Product(SQLModel, table=True):
    product_id: int = Field(default=None, primary_key=True)
    product_name: str
    category_id: int = Field(foreign_key="category.category_id")
    listed_date: datetime
    status: str  # active, inactive, out-of-stock
    category: Category = Relationship(back_populates="products")
    models: list["ProductModel"] = Relationship(back_populates="product")
    order_items: list["OrderItem"] = Relationship(back_populates="product")


class ProductModel(SQLModel, table=True):
    model_id: int = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.product_id")
    model_name: str
    sku: str = Field(unique=True)
    original_price: Decimal
    promo_price: Decimal
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    product: Product = Relationship(back_populates="models")
    stock_record: "StockRecord" = Relationship(back_populates="product_model")
    inventory_movements: list["InventoryMovement"] = Relationship(back_populates="product_model")
    purchase_items: list[PurchaseItem] = Relationship(back_populates="product_model")
    order_items: list["OrderItem"] = Relationship(back_populates="product_model")


class StockRecord(SQLModel, table=True):
    model_id: int = Field(foreign_key="productmodel.model_id", primary_key=True)
    stock_quantity: int
    last_updated: datetime = Field(default_factory=lambda: datetime.now(UTC))
    product_model: ProductModel = Relationship(back_populates="stock_record")


class InventoryMovement(SQLModel, table=True):
    movement_id: int = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="productmodel.model_id")
    order_id: Optional[str] = Field(default=None, foreign_key="order.order_id")
    movement_type: str  # purchase / outbound / return / adjust
    quantity: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    note: Optional[str] = None
    product_model: ProductModel = Relationship(back_populates="inventory_movements")
    order: Optional["Order"] = Relationship(back_populates="inventory_movements")


class Order(SQLModel, table=True):
    order_id: str = Field(primary_key=True)
    buyer_id: int = Field(foreign_key="buyer.buyer_id")
    product_total_price: Decimal
    shipping_fee: Decimal
    total_paid: Decimal
    order_status: OrderStatus
    cancel_reason: Optional[str] = None
    return_refund_status: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    payment_time: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    buyer: Buyer = Relationship(back_populates="orders")
    order_items: list["OrderItem"] = Relationship(back_populates="order")
    inventory_movements: list[InventoryMovement] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    item_id: int = Field(default=None, primary_key=True)
    order_id: str = Field(foreign_key="order.order_id")
    product_id: int = Field(foreign_key="product.product_id")
    model_id: int = Field(foreign_key="productmodel.model_id")
    quantity: int
    returned_quantity: int = Field(default=0)
    sold_price: Decimal
    total_price: Decimal
    order: Order = Relationship(back_populates="order_items")
    product: Product = Relationship(back_populates="order_items")
    product_model: ProductModel = Relationship(back_populates="order_items")