interface PurchaseSummaryProps {
  totalItems: number;
  totalQuantity: number;
  uniqueProductCount: number;
}

export const PurchaseSummary = ({
  totalItems,
  totalQuantity,
  uniqueProductCount,
}: PurchaseSummaryProps) => (
  <div className="bg-muted p-4 rounded-md my-6">
    <div className="flex flex-col md:flex-row gap-8 justify-end">
      <div className="mb-2 md:mb-0">
        <span className="text-sm text-muted-foreground">總商品數量</span>
        <p className="text-xl font-bold">
          {totalItems} 項商品
          {uniqueProductCount > 0 && uniqueProductCount < totalItems && (
            <span className="ml-2 text-sm text-blue-600">
              ({uniqueProductCount} 種不同商品)
            </span>
          )}
        </p>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">總叫貨數量</span>
        <p className="text-xl font-bold">{totalQuantity} 件</p>
      </div>
    </div>
  </div>
);
