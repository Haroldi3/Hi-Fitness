import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Card from "../components/Card";
import { layout } from "../theme/layout";

const KEY = "strengthLog";

export default function StrengthScreen() {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("135");
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    })();
  }, []);

  const save = async (next) => {
    setItems(next);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  };

  const onLog = async () => {
    const entry = {
      exercise,
      sets: Number(sets || 0),
      reps: Number(reps || 0),
      weight: Number(weight || 0),
      ts: Date.now(),
    };
    await save([entry, ...items]);
    setExercise("");
  };

  return (
    <ScrollView style={layout.screen} contentContainerStyle={layout.content}>
      <Card>
        <Text style={layout.h2}>Strength</Text>

        <Text style={layout.label}>Exercise</Text>
        <TextInput
          style={layout.input}
          value={exercise}
          onChangeText={setExercise}
          placeholder="e.g., Bench Press"
          placeholderTextColor="#6B7280"
        />

        <View style={[layout.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Sets</Text>
            <TextInput style={layout.input} value={sets} onChangeText={setSets} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Reps</Text>
            <TextInput style={layout.input} value={reps} onChangeText={setReps} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={layout.label}>Weight (lbs)</Text>
        <TextInput style={layout.input} value={weight} onChangeText={setWeight} keyboardType="number-pad" />

        <Pressable style={layout.button} onPress={onLog}>
          <Text style={layout.buttonText}>Log Strength</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={layout.h2}>Recent</Text>
        {items.length === 0 ? (
          <Text style={layout.muted}>No strength logged yet.</Text>
        ) : (
          items.slice(0, 10).map((x) => (
            <View key={x.ts} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{x.exercise || "Exercise"}</Text>
              <Text style={layout.muted}>
                {x.sets} sets • {x.reps} reps • {x.weight} lbs
              </Text>
              <View style={layout.divider} />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
