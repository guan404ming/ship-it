"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/database.types";

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierInsert =
  Database["public"]["Tables"]["suppliers"]["Insert"];

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

export async function getSupplierIdByName(
  name: string
): Promise<number | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data } = await supabase
    .from("suppliers")
    .select("supplier_id")
    .eq("supplier_name", name)
    .single();

  // if not found, create a new supplier
  if (!data) {
    const { data: newData, error: newError } = await supabase
      .from("suppliers")
      .insert([{ supplier_name: name }])
      .select()
      .single();

    if (newError) {
      console.error("Error creating supplier:", newError);
      throw new Error("Could not create supplier.");
    }

    return newData?.supplier_id;
  } else {
    return data?.supplier_id;
  }
}

export async function createSuppliers(supplierNames: SupplierInsert[]) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplierNames);

  if (error) {
    console.error("Error creating suppliers:", error);
    throw new Error("Could not create suppliers.");
  }

  return data;
}
