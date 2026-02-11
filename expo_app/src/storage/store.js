import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadJSON(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

export async function saveJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
