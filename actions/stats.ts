import { createClient } from "@/lib/supabase/server";
import { GroupedProductSales, SalesData } from "@/lib/types";
import { cookies } from "next/headers";

type OrderWithItems = {
  created_at: string | null;
  total_paid: number | null;
  order_items: {
    quantity: number | null;
  }[];
};

export async function getProductSalesStats(
  startDate: string,
  endDate: string
): Promise<SalesData[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: stats, error } = await supabase
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

export async function getProductStats(
  startDate: string,
  endDate: string
): Promise<GroupedProductSales[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const [products, models, orders] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("product_models").select("*"),
      supabase
        .from("orders")
        .select(
          `created_at, order_items (product_id, model_id, quantity, total_price)`
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate),
    ]);

    if (products.error || models.error || orders.error)
      throw products.error || models.error || orders.error;

    const dateList = Array.from(
      {
        length:
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1,
      },
      (_, i) =>
        new Date(new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
    );

    const result =
      products.data?.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name || "",
        listed_date: p.listed_date || "",
        status: p.status || "",
        models:
          models.data
            ?.filter((m) => m.product_id === p.product_id)
            .map((m) => ({
              model_id: m.model_id,
              model_name: m.model_name || "",
              original_price: m.original_price || 0,
              promo_price: m.promo_price,
              created_at: m.created_at || "",
              product_id: m.product_id || 0,
              data: dateList.map((d) => ({ date: d, amount: 0, quantity: 0 })),
            })) || [],
      })) || [];

    orders.data?.forEach((o) =>
      o.order_items?.forEach((i) => {
        const dateData = result
          .find((p) => p.product_id === i.product_id)
          ?.models.find((m) => m.model_id === i.model_id)
          ?.data.find(
            (d) =>
              d.date === new Date(o.created_at!).toISOString().split("T")[0]
          );
        if (dateData) {
          dateData.amount += Number(i.total_price) || 0;
          dateData.quantity += Number(i.quantity) || 0;
        }
      })
    );

    return result;
  } catch (error) {
    console.error("Error in getProductStats:", error);
    return [];
  }
}
