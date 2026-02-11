import { api } from "./client";

export async function fetchTrails({ lat, lon, radius = 5000 }) {
  const r = await api.get("/api/places/trails", { params: { lat, lon, radius } });
  return r.data?.places || [];
}
