import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable, Alert } from "react-native";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { api } from "../api/client";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";
import { todayKey } from "../utils/date";

export default function NutritionScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [meals, setMeals] = useState([]);

  const today = todayKey();
  const storageKey = `${STORAGE_KEYS.nutritionDay}_${today}`;

  // Load saved meals for today
  useEffect(() => {
    (async () => {
      const saved = await loadJSON(storageKey);
      if (saved && saved.meals) setMeals(saved.meals);
    })();
  }, []);

  // Totals
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, m) => ({
        calories: acc.calories + (m.calories || 0),
        protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0),
        fat: acc.fat + (m.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [meals]);

  // Persist whenever meals change
  useEffect(() => {
    (async () => {
      await saveJSON(storageKey, { ...totals, meals });
    })();
  }, [meals]);

  async function searchFood() {
    if (!query.trim()) return;

    try {
      const res = await api.get("/api/nutrition/search", { params: { q: query.trim() } });
      const items = res.data?.items ?? [];
      setResults(items);
      if (!items.length) Alert.alert("No results", "No foods found for that search.");
    } catch (e) {
      console.log(e?.message || e);
      Alert.alert(
        "Food search failed",
        "Check that your backend is running and FatSecret keys are set in .env."
      );
    }
  }

  function addFood(item) {
    setMeals((prev) => [...prev, item]);
    setResults([]);
    setQuery("");
  }

  function removeFood(idx) {
    setMeals((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* Today's Totals */}
      <Card>
        <Text style={commonStyles.h2}>Today ({today})</Text>
        <ProgressBar label="Calories" value={totals.calories} goal={2000} suffix=" kcal" />
        <ProgressBar label="Protein" value={totals.protein} goal={150} suffix="g" />
        <ProgressBar label="Carbs" value={totals.carbs} goal={250} suffix="g" />
        <ProgressBar label="Fat" value={totals.fat} goal={65} suffix="g" />
      </Card>

      {/* Search */}
      <Card>
        <Text style={commonStyles.h2}>Food Search</Text>

        <TextInput
          style={commonStyles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search food (e.g., white rice)"
          placeholderTextColor="#666"
          onSubmitEditing={searchFood}
          returnKeyType="search"
        />

        <Pressable onPress={searchFood} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Search</Text>
        </Pressable>

        {results.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {results.map((item, idx) => (
              <Pressable
                key={`${item.id || item.name}-${idx}`}
                onPress={() => addFood(item)}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>{item.name}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                  {item.calories} kcal · P:{item.protein || 0}g · C:{item.carbs || 0}g · F:{item.fat || 0}g
                </Text>
                <Text style={{ color: COLORS.primary, fontSize: 11, marginTop: 2 }}>
                  Tap to add
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {/* Logged Meals */}
      {meals.length > 0 && (
        <Card>
          <Text style={commonStyles.h2}>Logged Meals</Text>
          {meals.map((item, idx) => (
            <Pressable
              key={`meal-${idx}`}
              onLongPress={() => {
                Alert.alert("Remove", `Remove ${item.name}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: () => removeFood(idx) },
                ]);
              }}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                {item.calories} kcal · P:{item.protein || 0}g · C:{item.carbs || 0}g · F:{item.fat || 0}g
              </Text>
            </Pressable>
          ))}
          <Text style={[commonStyles.mutedText, { fontSize: 11, marginTop: 8 }]}>
            Long-press to remove an item
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
