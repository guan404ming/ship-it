import { createClient } from "@/lib/supabase/server";
import { GroupedProductSales, RankingProduct, SalesData } from "@/lib/types";
import { cookies } from "next/headers";

type OrderItem = {
  product_id: number;
  model_id: number;
  quantity: number;
  total_price: number;
};

type Order = {
  created_at: string;
  total_paid: number;
  order_items: OrderItem[];
};

type ModelSales = {
  sales: number;
  quantity: number;
};

function getDateList(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function calculateModelSales(orders: Order[]): Map<number, ModelSales> {
  const sales = new Map<number, ModelSales>();
  orders?.forEach((order) =>
    order.order_items?.forEach((item) => {
      const current = sales.get(item.model_id) || { sales: 0, quantity: 0 };
      sales.set(item.model_id, {
        sales: current.sales + (Number(item.total_price) || 0),
        quantity: current.quantity + (Number(item.quantity) || 0),
      });
    })
  );
  return sales;
}

export async function getHistoryData(
  startDate: string,
  endDate: string
): Promise<{
  salesData: SalesData[];
  productSalesData: GroupedProductSales[];
  productRankingData: RankingProduct[];
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Calculate previous period dates
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    const timeDiff = previousEndDate.getTime() - previousStartDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - timeDiff);
    previousEndDate.setTime(previousEndDate.getTime() - timeDiff);

    // Fetch all required data
    const [products, models, orders, previousOrders] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("product_models").select("*"),
      supabase
        .from("orders")
        .select(
          `
        created_at, total_paid, order_items (
          product_id, model_id, quantity, total_price
        )
      `
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate),
      supabase
        .from("orders")
        .select(
          `
        created_at, total_paid, order_items (
          product_id, model_id, quantity, total_price
        )
      `
        )
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString()),
    ]);

    if (products.error || models.error || orders.error || previousOrders.error)
      throw (
        products.error || models.error || orders.error || previousOrders.error
      );

    const dateList = getDateList(startDate, endDate);
    const modelSales = calculateModelSales(orders.data);
    const previousModelSales = calculateModelSales(previousOrders.data);

    // Process sales data
    const salesData = dateList.map((date) => {
      const dayOrders =
        orders.data?.filter(
          (o) => new Date(o.created_at!).toISOString().split("T")[0] === date
        ) || [];

      return {
        date,
        amount: dayOrders.reduce(
          (sum, o) => sum + (Number(o.total_paid) || 0),
          0
        ),
        quantity: dayOrders.reduce(
          (sum, o) =>
            sum +
            (o.order_items?.reduce(
              (s, i) => s + (Number(i.quantity) || 0),
              0
            ) || 0),
          0
        ),
      };
    });

    // Process product sales data
    const productSalesData =
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
              data: dateList.map((d) => {
                const dayOrders =
                  orders.data?.filter(
                    (o) =>
                      new Date(o.created_at!).toISOString().split("T")[0] ===
                        d &&
                      o.order_items?.some((i) => i.model_id === m.model_id)
                  ) || [];

                return {
                  date: d,
                  amount: dayOrders.reduce(
                    (sum, o) =>
                      sum +
                      (o.order_items?.reduce(
                        (s, i) =>
                          i.model_id === m.model_id
                            ? s + (Number(i.total_price) || 0)
                            : s,
                        0
                      ) || 0),
                    0
                  ),
                  quantity: dayOrders.reduce(
                    (sum, o) =>
                      sum +
                      (o.order_items?.reduce(
                        (s, i) =>
                          i.model_id === m.model_id
                            ? s + (Number(i.quantity) || 0)
                            : s,
                        0
                      ) || 0),
                    0
                  ),
                };
              }),
            })) || [],
      })) || [];

    // Process ranking data
    const productRankingData =
      products.data?.flatMap(
        (p) =>
          models.data
            ?.filter((m) => m.product_id === p.product_id)
            .map((m) => {
              const current = modelSales.get(m.model_id) || {
                sales: 0,
                quantity: 0,
              };
              const previous = previousModelSales.get(m.model_id) || {
                sales: 0,
                quantity: 0,
              };
              const growth =
                previous.sales === 0
                  ? 0
                  : ((current.sales - previous.sales) / previous.sales) * 100;

              return {
                product_id: p.product_id,
                product_name: p.product_name || "",
                listed_date: p.listed_date || "",
                status: p.status || "",
                model_id: m.model_id,
                model_name: m.model_name || "",
                original_price: m.original_price || 0,
                promo_price: m.promo_price,
                created_at: m.created_at || "",
                sales: current.sales,
                quantity: current.quantity,
                growth: Number(growth.toFixed(1)),
              };
            }) || []
      ) || [];

    return { salesData, productSalesData, productRankingData };
  } catch (error) {
    console.error("Error in getHistoryData:", error);
    return { salesData: [], productSalesData: [], productRankingData: [] };
  }
}
