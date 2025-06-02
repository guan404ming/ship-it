import {
  getGrowthComparisonPeriods,
  calculateGrowthRate,
} from "@/lib/date-utils";
import { SalesData, ProductSalesModel, GroupedProductSales } from "@/lib/types";
import dayjs from "dayjs";

/**
 * 計算商品在指定時間範圍內的銷售數據
 */
export function getProductDateRangeData(
  product: GroupedProductSales,
  startDate: Date,
  endDate: Date
): SalesData[] {
  // 收集所有規格的數據並按日期合併
  const dateMap = new Map<
    string,
    { date: string; amount: number; quantity: number }
  >();

  product.models?.forEach((model) => {
    model.data
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      })
      .forEach((item) => {
        if (dateMap.has(item.date)) {
          const existing = dateMap.get(item.date)!;
          dateMap.set(item.date, {
            date: item.date,
            amount: existing.amount + item.amount,
            quantity: existing.quantity + item.quantity,
          });
        } else {
          dateMap.set(item.date, { ...item });
        }
      });
  });

  // 將合併後的數據轉為陣列並排序
  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * 計算商品的成長率
 */
export function calculateProductGrowthRates(
  product: GroupedProductSales,
  timeRange: string,
  customDateRange: { start: string; end: string } | null,
  referenceDate: Date = dayjs().toDate()
): { quantityGrowth?: number; amountGrowth?: number } {
  // 獲取比較期間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);

  // 獲取所有商品數據
  const allData = product.models?.flatMap((model) => model.data) || [];

  // 將數據分為兩個區間
  const currentPeriodData = allData.filter((item) => {
    const date = new Date(item.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });

  const previousPeriodData = allData.filter((item) => {
    const date = new Date(item.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  });

  // 計算當前區間和前一區間的總量
  const currentQuantity = currentPeriodData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const previousQuantity = previousPeriodData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const currentAmount = currentPeriodData.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const previousAmount = previousPeriodData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // 計算成長率
  const quantityGrowth = calculateGrowthRate(currentQuantity, previousQuantity);
  const amountGrowth = calculateGrowthRate(currentAmount, previousAmount);

  return { quantityGrowth, amountGrowth };
}

/**
 * 計算商品規格的成長率
 */
export function calculateProductModelGrowthRates(
  model: ProductSalesModel,
  timeRange: string,
  customDateRange: { start: string; end: string } | null,
  referenceDate: Date = dayjs().toDate()
): { quantityGrowth?: number; amountGrowth?: number } {
  // 獲取比較期間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);

  // 獲取所有數據
  const allData = [...model.data];

  // 將數據分為兩個區間
  const currentPeriodData = allData.filter((item) => {
    const date = new Date(item.date);
    return date >= currentPeriodStart && date <= currentPeriodEnd;
  });

  const previousPeriodData = allData.filter((item) => {
    const date = new Date(item.date);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  });

  // 計算當前區間和前一區間的總量
  const currentQuantity = currentPeriodData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const previousQuantity = previousPeriodData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const currentAmount = currentPeriodData.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const previousAmount = previousPeriodData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  // 計算成長率
  const quantityGrowth = calculateGrowthRate(currentQuantity, previousQuantity);
  const amountGrowth = calculateGrowthRate(currentAmount, previousAmount);

  return { quantityGrowth, amountGrowth };
}
