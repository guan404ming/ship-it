"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getProducts() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("products").select("*");

  if (error) {
    throw error;
  }

  return data;
}
