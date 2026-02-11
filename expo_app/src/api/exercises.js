import { api } from "./client";

export async function fetchExercises({ muscle, difficulty }) {
  const r = await api.get("/api/exercises", { params: { muscle, difficulty } });
  return r.data?.results || [];
}
