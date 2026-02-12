import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable, Alert } from "react-native";
import Card from "../components/Card";
import { commonStyles } from "../ui/layout";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";

export default function StrengthScreen() {
  const [exercise, setExercise] = useState("Bench Press");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8");
  const [weight, setWeight] = useState("50");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await loadJSON(STORAGE_KEYS.strengthLog);
      if (saved && Array.isArray(saved)) setLogs(saved);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await saveJSON(STORAGE_KEYS.strengthLog, logs);
    })();
  }, [logs]);

  function addStrength() {
    const s = Number(sets);
    const r = Number(reps);
    const w = Number(weight);

    if (!exercise.trim()) return Alert.alert("Missing", "Enter an exercise.");
    if (!s || s <= 0) return Alert.alert("Invalid", "Sets must be > 0.");
    if (!r || r <= 0) return Alert.alert("Invalid", "Reps must be > 0.");
    if (!w || w <= 0) return Alert.alert("Invalid", "Weight must be > 0.");

    const log = {
      id: `${Date.now()}`,
      time: new Date().toISOString(),
      exercise: exercise.trim(),
      sets: s,
      reps: r,
      weight: w,
    };

    setLogs((prev) => [log, ...prev].slice(0, 50));
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Card>
        <Text style={commonStyles.h2}>Strength</Text>

        <Text style={commonStyles.label}>Exercise</Text>
        <TextInput style={commonStyles.input} value={exercise} onChangeText={setExercise} />

        <View style={[commonStyles.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Sets</Text>
            <TextInput style={commonStyles.input} value={sets} onChangeText={setSets} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Reps</Text>
            <TextInput style={commonStyles.input} value={reps} onChangeText={setReps} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={commonStyles.label}>Weight (lbs)</Text>
        <TextInput style={commonStyles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />

        <Pressable onPress={addStrength} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Log Strength</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={commonStyles.h2}>Recent</Text>
        {logs.length === 0 ? (
          <Text style={commonStyles.mutedText}>No lifts logged yet.</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#222" }}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{log.exercise}</Text>
              <Text style={{ color: "#aaa" }}>
                {log.sets}x{log.reps} @ {log.weight} lbs
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
