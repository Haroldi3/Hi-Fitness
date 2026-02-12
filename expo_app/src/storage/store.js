import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveJSON(key, value) {
  if (!key || typeof key !== "string") throw new Error("Invalid storage key");
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadJSON(key) {
  if (!key || typeof key !== "string") throw new Error("Invalid storage key");
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}
