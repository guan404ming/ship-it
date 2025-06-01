// Buffett May. 26
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import { SalesData } from "@/lib/types";

const db = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type OrderWithItems = {
  created_at: string | null;
  total_paid: number | null;
  order_items: {
    quantity: number | null;
  }[];
};

type ProductStatsPoint = {
  date: string;
  amount: number;
  quantity: number;
};

type ProductStats = {
  product_id: number;
  data: ProductStatsPoint[];
};

export async function getProductSalesStats(
  startDate: string,
  endDate: string
): Promise<SalesData[]> {
  try {
    const { data: stats, error } = await db
      .from("orders")
      .select(
        `
        created_at,
        total_paid,
        order_items (
          quantity
        )
      `
      )
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    const dailyStatsMap = (stats || []).reduce(
      (acc: Record<string, SalesData>, order: OrderWithItems) => {
        if (!order.created_at) return acc;

        const date = new Date(order.created_at).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            amount: 0,
            quantity: 0,
          };
        }
        acc[date].amount += Number(order.total_paid) || 0;
        acc[date].quantity += (order.order_items || []).reduce(
          (sum: number, item) => sum + (Number(item.quantity) || 0),
          0
        );
        return acc;
      },
      {}
    );

    // Create date list between startDate and endDate
    const dateList: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      dateList.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    // Missing Data Date --> {date: "2025-01-01", amount: 0, quantity: 0}
    const completeStats: SalesData[] = dateList.map((date) => {
      return (
        dailyStatsMap[date] ?? {
          date,
          amount: 0,
          quantity: 0,
        }
      );
    });

    return completeStats.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error getting product sales stats:", error);
    return [];
  }
}

// 當使用者選取商品後，根據選取的時間範圍，回傳所選商品加總 order_items.amount（銷售額）、加總 order_items.quantity （銷售量）的時間序列
// Input: Product_ID(s), 起始日期, 結束日期
// Output: Product_IDs: {每日銷售額, 每日銷售數量}
// {
//   "success": true,
//   "data": [
//     {
//       "product_id": 1,
//       "data": [
//         {
//            "date": "2024-01-02",
//            "amount": 3800,
//            "quantity": 21
//         },
//         ...
//       ]
//     },
//   ]
// }
export async function getProductStatsByIds(
  productIds: number[],
  startDate: string,
  endDate: string
): Promise<{ success: boolean; data?: ProductStats[]; error?: string }> {
  try {
    // Input validation
    if (!productIds?.length) {
      throw new Error("Product IDs are required");
    }

    const { data: orders, error } = await db
      .from("orders")
      .select(
        `
        created_at,
        order_items (
          product_id,
          quantity,
          total_price
        )
      `
      )
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (error) throw error;

    // 建立日期清單
    const dateList: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dateList.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    // 初始化 product map: product_id -> { date -> { amount, quantity } }
    const productMap: Record<number, Record<string, ProductStatsPoint>> = {};

    // Initialize data structure for each product ID and date
    productIds.forEach((productId) => {
      productMap[productId] = {};
      dateList.forEach((date) => {
        productMap[productId][date] = {
          date,
          amount: 0,
          quantity: 0,
        };
      });
    });

    // Process orders and aggregate data
    if (orders) {
      orders.forEach((order) => {
        if (!order.created_at || !order.order_items) return;

        const date = new Date(order.created_at).toISOString().split("T")[0];

        order.order_items.forEach((item) => {
          if (!item.product_id || !productIds.includes(item.product_id)) return;

          const productStats = productMap[item.product_id][date];
          if (productStats) {
            productStats.amount += Number(item.total_price) || 0;
            productStats.quantity += Number(item.quantity) || 0;
          }
        });
      });
    }

    // Convert to final format and sort data
    const result: ProductStats[] = productIds.map((productId) => ({
      product_id: productId,
      data: Object.values(productMap[productId]).sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    }));

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in getProductStatsByIds:", error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
