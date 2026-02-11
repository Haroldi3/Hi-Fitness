import { api } from "./client";

export async function mealPhotoEstimate(fileUri) {
  const form = new FormData();
  form.append("image", {
    uri: fileUri,
    name: "meal.jpg",
    type: "image/jpeg",
  });

  const r = await api.post("/api/meal-photo/estimate", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return r.data;
}
