import dayjs from "dayjs";

/**
 * 日期和成長率計算相關的工具函數 (全部用 dayjs 處理)
 */

/**
 * 根據時間範圍標識符獲取天數
 */
export function getDaysFromTimeRange(timeRange: string): number {
  return timeRange === "7d"
    ? 7
    : timeRange === "30d"
      ? 30
      : timeRange === "90d"
        ? 90
        : timeRange === "180d"
          ? 180
          : timeRange === "all"
            ? 365 * 2
            : 90; // 預設90天
}

/**
 * 自訂日期範圍的天數計算
 */
export function getCustomDateRangeDays(
  timeRange: string,
  customDateRange: { start: string; end: string } | null
): number {
  // 基本天數
  const baseDays = getDaysFromTimeRange(timeRange);

  // 如果是自定義區間，計算實際天數
  if (timeRange === "custom" && customDateRange) {
    const start = dayjs(customDateRange.start);
    const end = dayjs(customDateRange.end);
    return end.diff(start, "day");
  }

  return baseDays;
}

/**
 * 計算日期範圍
 */
export function getDateRange(
  timeRange: string,
  customDateRange: { start: string; end: string } | null,
  referenceDate: Date = dayjs().toDate()
): { startDate: Date; endDate: Date } {
  const now = dayjs(referenceDate);
  let startDate: dayjs.Dayjs;
  let endDate = now;

  if (customDateRange) {
    startDate = dayjs(customDateRange.start);
    endDate = dayjs(customDateRange.end);
  } else {
    const daysToSubtract = getDaysFromTimeRange(timeRange);
    startDate = now.subtract(daysToSubtract, "day");
  }

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}

/**
 * 計算成長率比較期間
 */
export function getGrowthComparisonPeriods(
  timeRange: string,
  customDateRange: { start: string; end: string } | null,
  referenceDate: Date = dayjs().toDate()
): {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  previousPeriodStart: Date;
  previousPeriodEnd: Date;
} {
  const now = dayjs(referenceDate);
  const daysDiff = getCustomDateRangeDays(timeRange, customDateRange);

  // 當前區間
  const currentPeriodEnd = now;
  const currentPeriodStart = now.subtract(daysDiff, "day");

  // 前一個區間
  const previousPeriodEnd = currentPeriodStart.subtract(1, "day");
  const previousPeriodStart = previousPeriodEnd.subtract(daysDiff, "day");

  return {
    currentPeriodStart: currentPeriodStart.toDate(),
    currentPeriodEnd: currentPeriodEnd.toDate(),
    previousPeriodStart: previousPeriodStart.toDate(),
    previousPeriodEnd: previousPeriodEnd.toDate(),
  };
}

/**
 * 計算成長率
 */
export function calculateGrowthRate(
  currentValue: number,
  previousValue: number
): number | undefined {
  if (previousValue <= 0) return undefined;
  return parseFloat(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
  );
}

/**
 * 篩選特定時間區間的數據
 */
export function filterDataByDateRange<T extends { date: string }>(
  data: T[],
  startDate: Date,
  endDate: Date
): T[] {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  return data.filter((item) => {
    const itemDate = dayjs(item.date);
    return (
      (itemDate.isSame(start, "day") || itemDate.isAfter(start, "day")) &&
      (itemDate.isSame(end, "day") || itemDate.isBefore(end, "day"))
    );
  });
}

/**
 * 彙總數據中的數值欄位
 */
export function sumDataValues<T>(data: T[], valueField: keyof T): number {
  return data.reduce((sum, item) => {
    const value = item[valueField];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * 計算數據的成長率
 */
export function calculateDataGrowthRates<T extends { date: string }>(
  allData: T[],
  timeRange: string,
  customDateRange: { start: string; end: string } | null,
  valueFields: Array<keyof T>,
  referenceDate: Date = dayjs().toDate()
): Record<string, number | undefined> {
  // 取得日期區間
  const {
    currentPeriodStart,
    currentPeriodEnd,
    previousPeriodStart,
    previousPeriodEnd,
  } = getGrowthComparisonPeriods(timeRange, customDateRange, referenceDate);

  // 將數據分為兩個區間
  const currentPeriodData = filterDataByDateRange(
    allData,
    currentPeriodStart,
    currentPeriodEnd
  );
  const previousPeriodData = filterDataByDateRange(
    allData,
    previousPeriodStart,
    previousPeriodEnd
  );

  // 計算每個欄位的成長率
  const result: Record<string, number | undefined> = {};

  valueFields.forEach((field) => {
    const fieldName = String(field);
    const currentTotal = sumDataValues(currentPeriodData, field);
    const previousTotal = sumDataValues(previousPeriodData, field);
    result[fieldName] = calculateGrowthRate(currentTotal, previousTotal);
  });

  return result;
}
