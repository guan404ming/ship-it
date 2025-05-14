import { 
  getGrowthComparisonPeriods,
  calculateGrowthRate
} from "@/lib/date-utils";

// 產品資料類型
export interface SalesData {
  date: string;
  amount: number;
  quantity: number;
}

export interface ProductModel {
  id: string;
  model_name: string; // Changed from spec to align with database
  data: SalesData[];
}

export interface GroupedProduct {
  id: string;
  sku: string; // Changed from vendorCode to align with database
  product_name: string; // Changed from productName to align with database
  category_name: string; // Changed from productCategory to align with database
  models: ProductModel[];
}

/**
 * 計算產品在指定時間範圍內的銷售數據
 */
export function getProductDateRangeData(product: GroupedProduct, startDate: Date, endDate: Date): SalesData[] {
  // 收集所有型號的數據並按日期合併
  const dateMap = new Map<string, { date: string, amount: number, quantity: number }>();

  product.models.forEach(model => {
    model.data
      .filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .forEach(item => {
        if (dateMap.has(item.date)) {
          const existing = dateMap.get(item.date)!;
          dateMap.set(item.date, {
            date: item.date,
            amount: existing.amount + item.amount,
            quantity: existing.quantity + item.quantity
          });
        } else {
          dateMap.set(item.date, { ...item });
        }
      });
  });

  // 將合併後的數據轉為陣列並排序
  return Array.from(dateMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * 計算產品的成長率
 */
export function calculateProductGrowthRates(
  product: GroupedProduct,
  timeRange: string,
  customDateRange: { start: string, end: string } | null,
  referenceDate: Date = new Date("2025-05-01")
): { quantityGrowth?: number, amountGrowth?: number } {
  // 獲取比較期間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);
  
  // 獲取所有產品數據
  const allData = product.models.flatMap(model => model.data);
  
  // 將數據分為兩個區間
  const currentPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });
  
  const previousPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  });
  
  // 計算當前區間和前一區間的總量
  const currentQuantity = currentPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  const previousQuantity = previousPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  
  const currentAmount = currentPeriodData.reduce((sum, item) => sum + item.amount, 0);
  const previousAmount = previousPeriodData.reduce((sum, item) => sum + item.amount, 0);
  
  // 計算成長率
  const quantityGrowth = calculateGrowthRate(currentQuantity, previousQuantity);
  const amountGrowth = calculateGrowthRate(currentAmount, previousAmount);
  
  return { quantityGrowth, amountGrowth };
}

/**
 * 計算產品型號的成長率
 */
export function calculateProductModelGrowthRates(
  model: ProductModel,
  timeRange: string,
  customDateRange: { start: string, end: string } | null,
  referenceDate: Date = new Date("2025-05-01")
): { quantityGrowth?: number, amountGrowth?: number } {
  // 獲取比較期間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);
  
  // 獲取所有數據
  const allData = [...model.data];
  
  // 將數據分為兩個區間
  const currentPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });
  
  const previousPeriodData = allData.filter(item => {
    const date = new Date(item.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  });
  
  // 計算當前區間和前一區間的總量
  const currentQuantity = currentPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  const previousQuantity = previousPeriodData.reduce((sum, item) => sum + item.quantity, 0);
  
  const currentAmount = currentPeriodData.reduce((sum, item) => sum + item.amount, 0);
  const previousAmount = previousPeriodData.reduce((sum, item) => sum + item.amount, 0);
  
  // 計算成長率
  const quantityGrowth = calculateGrowthRate(currentQuantity, previousQuantity);
  const amountGrowth = calculateGrowthRate(currentAmount, previousAmount);
  
  return { quantityGrowth, amountGrowth };
}
