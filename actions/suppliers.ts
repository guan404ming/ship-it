"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/database.types";

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

export async function getSuppliers(): Promise<Supplier[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("suppliers").select("*");

  if (error) {
    console.error("Error fetching suppliers:", error);
    throw new Error("Could not fetch suppliers.");
  }

  return data || [];
}
