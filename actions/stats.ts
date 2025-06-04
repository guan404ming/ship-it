import { createClient } from "@/lib/supabase/server";
import { GroupedProductSales, RankingProduct, SalesData } from "@/lib/types";
import { cookies } from "next/headers";

export async function getHistoryData(): Promise<{
  salesData: SalesData[];
  productSalesData: GroupedProductSales[];
  productRankingData: RankingProduct[];
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 定義 sales_by_date view 的型別
  type SalesByDateRow = {
    date: string;
    model_id: number;
    product_id: number;
    amount: number;
    quantity: number;
  };

  try {
    // 1. 直接 select sales_by_date view
    const { data: salesByDate, error: salesByDateError } = await supabase
      .from("sales_by_date")
      .select("*");
    if (salesByDateError) throw salesByDateError;

    // 2. 撈 products, models
    const [products, models] = await Promise.all([
      supabase
        .from("products")
        .select("product_id, product_name, listed_date, status"),
      supabase
        .from("product_models")
        .select(
          "model_id, product_id, model_name, original_price, promo_price, created_at"
        ),
    ]);
    if (products.error || models.error) throw products.error || models.error;

    // 3. 組合 salesData
    // 只要日期、總金額、總數量
    const salesDataMap = new Map<
      string,
      { amount: number; quantity: number }
    >();
    (salesByDate as SalesByDateRow[])?.forEach((row) => {
      const date = row.date.split("T")[0];
      const prev = salesDataMap.get(date) || { amount: 0, quantity: 0 };
      salesDataMap.set(date, {
        amount: prev.amount + Number(row.amount || 0),
        quantity: prev.quantity + Number(row.quantity || 0),
      });
    });
    const salesData: SalesData[] = Array.from(salesDataMap.entries()).map(
      ([date, v]) => ({
        date,
        amount: v.amount,
        quantity: v.quantity,
      })
    );

    // 4. 組合 productSalesData
    const productSalesData: GroupedProductSales[] =
      products.data?.map((p) => {
        const productModels =
          models.data?.filter((m) => m.product_id === p.product_id) || [];
        return {
          product_id: p.product_id,
          product_name: p.product_name,
          listed_date: p.listed_date,
          status: p.status,
          models: productModels.map((m) => {
            const modelData =
              (salesByDate as SalesByDateRow[])?.filter(
                (d) => d.model_id === m.model_id
              ) || [];
            return {
              ...m,
              data: modelData.map((d) => ({
                date: d.date.split("T")[0],
                amount: Number(d.amount) || 0,
                quantity: Number(d.quantity) || 0,
              })),
            };
          }),
        };
      }) || [];

    // 5. 組合 productRankingData
    const modelSalesMap = new Map<
      number,
      { amount: number; quantity: number }
    >();
    (salesByDate as SalesByDateRow[])?.forEach((row) => {
      const prev = modelSalesMap.get(row.model_id) || {
        amount: 0,
        quantity: 0,
      };
      modelSalesMap.set(row.model_id, {
        amount: prev.amount + Number(row.amount || 0),
        quantity: prev.quantity + Number(row.quantity || 0),
      });
    });
    const productRankingData: RankingProduct[] =
      models.data?.map((m) => {
        const p = products.data?.find((p) => p.product_id === m.product_id);
        const sales = modelSalesMap.get(m.model_id) || {
          amount: 0,
          quantity: 0,
        };
        return {
          product_id: p?.product_id || 0,
          product_name: p?.product_name || "",
          listed_date: p?.listed_date || "",
          status: p?.status || "",
          model_id: m.model_id,
          model_name: m.model_name,
          original_price: m.original_price,
          promo_price: m.promo_price,
          created_at: m.created_at,
          sales: sales.amount,
          quantity: sales.quantity,
          growth: undefined, // 若要計算成長率，需再查詢前一期間資料
        };
      }) || [];

    return { salesData, productSalesData, productRankingData };
  } catch (error) {
    console.error("Error in getHistoryData:", error);
    return { salesData: [], productSalesData: [], productRankingData: [] };
  }
}
