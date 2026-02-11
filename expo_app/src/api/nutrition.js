import { api } from "./client";

export async function nutritionNatural(query) {
  const r = await api.post("/api/nutrition/natural", { query });
  return r.data;
}
