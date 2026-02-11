import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";

import Card from "../components/Card";
import { layout } from "../theme/layout";
import { searchFood } from "../api/nutrition";

export default function NutritionScreen() {
  const [query, setQuery] = useState("White rice");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const onSearch = async () => {
    setError("");
    setResults([]);
    try {
      const data = await searchFood(query);
      setResults(data?.foods ?? data ?? []);
    } catch (e) {
      setError("Food search failed (check backend/.env).");
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <ScrollView style={layout.screen} contentContainerStyle={layout.content}>
      <Card>
        <Text style={layout.h2}>Today ({today})</Text>

        <Text style={layout.label}>Food Search</Text>
        <TextInput
          style={layout.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search food…"
          placeholderTextColor="#6B7280"
        />

        <Pressable style={layout.button} onPress={onSearch}>
          <Text style={layout.buttonText}>Search</Text>
        </Pressable>

        {error ? <Text style={{ color: "#EF4444", marginTop: 10 }}>{error}</Text> : null}
      </Card>

      <Card>
        <Text style={layout.h2}>Results</Text>
        {results?.length ? (
          results.slice(0, 10).map((r, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {r.name || r.food_name || "Food"}
              </Text>
              <Text style={layout.muted}>
                {r.calories || r.calories_kcal || "?"} kcal
              </Text>
              <View style={layout.divider} />
            </View>
          ))
        ) : (
          <Text style={layout.muted}>No results yet.</Text>
        )}
      </Card>
    </ScrollView>
  );
}
