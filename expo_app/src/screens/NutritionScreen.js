import React, { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable, Alert } from "react-native";
import Card from "../components/Card";
import { commonStyles } from "../ui/layout";
import { api } from "../api/client";

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function NutritionScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [kcalTarget, setKcalTarget] = useState(2000);
  const [kcalToday, setKcalToday] = useState(0);

  const day = useMemo(() => todayStr(), []);

  async function searchFood() {
    if (!query.trim()) return;

    try {
      // GET /api/food/search?q=rice
      const res = await api.get(`/api/food/search`, { params: { q: query.trim() } });

      // Expected shape: { items: [{ name, calories }] }
      const items = res.data?.items ?? [];
      setResults(items);
      if (!items.length) Alert.alert("No results", "Backend returned no items.");
    } catch (e) {
      console.log(e?.message || e);
      Alert.alert(
        "Food search failed",
        "Your backend is failing or API key is missing.\n\nCheck backend .env + make sure backend is running."
      );
    }
  }

  function addCalories(item) {
    const c = Number(item.calories) || 0;
    setKcalToday((prev) => prev + c);
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Card>
        <Text style={commonStyles.h2}>Today ({day})</Text>
        <Text style={commonStyles.mutedText}>
          Calories: {kcalToday} kcal / {kcalTarget} kcal
        </Text>
      </Card>

      <Card>
        <Text style={commonStyles.h2}>Food Search</Text>

        <TextInput
          style={commonStyles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search food (e.g., white rice)"
          placeholderTextColor="#666"
        />

        <Pressable onPress={searchFood} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Search</Text>
        </Pressable>

        {results.length === 0 ? (
          <Text style={[commonStyles.mutedText, { marginTop: 10 }]}>
            No results yet.
          </Text>
        ) : (
          <View style={{ marginTop: 10 }}>
            {results.map((item, idx) => (
              <Pressable
                key={`${item.name}-${idx}`}
                onPress={() => addCalories(item)}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#222",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {item.name}
                </Text>
                <Text style={{ color: "#aaa" }}>
                  {item.calories} kcal (tap to add)
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}
