import { api } from "./client";

export async function nutritionSearch(query) {
  const r = await api.get("/api/nutrition/search", { params: { q: query } });
  return r.data;
}
