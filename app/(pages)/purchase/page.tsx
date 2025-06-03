import { getPurchaseDashboardData } from "@/actions/purchase";
import PurchaseTempClient from "./client";

export default async function PurchaseTempPage() {
  const purchaseData = await getPurchaseDashboardData();
  return <PurchaseTempClient initialPurchase={purchaseData} />;
}
