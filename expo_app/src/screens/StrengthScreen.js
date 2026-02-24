import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Card from "../components/Card";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";
import { fetchExercises } from "../api/exercises";

const MUSCLE_GROUPS = [
  { label: "Select muscle group…", value: "" },
  { label: "Chest", value: "chest" },
  { label: "Biceps", value: "biceps" },
  { label: "Triceps", value: "triceps" },
  { label: "Lats", value: "lats" },
  { label: "Middle Back", value: "middle_back" },
  { label: "Lower Back", value: "lower_back" },
  { label: "Shoulders", value: "shoulders" },
  { label: "Quadriceps", value: "quadriceps" },
  { label: "Hamstrings", value: "hamstrings" },
  { label: "Glutes", value: "glutes" },
  { label: "Calves", value: "calves" },
  { label: "Abdominals", value: "abdominals" },
  { label: "Forearms", value: "forearms" },
  { label: "Traps", value: "traps" },
];

export default function StrengthScreen() {
  // Exercise selection
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Chosen exercise + log form
  const [exercise, setExercise] = useState("");
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

  async function handleMuscleChange(muscle) {
    setSelectedMuscle(muscle);
    setSuggestions([]);
    setExercise("");

    if (!muscle) return;

    setLoading(true);
    try {
      const results = await fetchExercises({ muscle });
      setSuggestions(results);
      if (!results.length) {
        Alert.alert("No results", `No exercises found for "${muscle}".`);
      }
    } catch (e) {
      console.log("Exercise API error:", e?.message || e);
      Alert.alert(
        "Exercise lookup failed",
        "Check that your backend is running and APININJAS_KEY is set in .env."
      );
    } finally {
      setLoading(false);
    }
  }

  function pickExercise(name) {
    setExercise(name);
  }

  function clearSelection() {
    setExercise("");
    setSuggestions([]);
    setSelectedMuscle("");
  }

  function addStrength() {
    const s = Number(sets);
    const r = Number(reps);
    const w = Number(weight);

    if (!exercise.trim()) return Alert.alert("Missing", "Pick an exercise first.");
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
    Alert.alert("Logged!", `${exercise} — ${s}x${r} @ ${w} lbs`);
    clearSelection();
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* Step 1: Pick muscle group from dropdown */}
      <Card>
        <Text style={commonStyles.h2}>Find an Exercise</Text>

        <Text style={commonStyles.label}>Muscle Group</Text>
        <View
          style={{
            backgroundColor: COLORS.inputBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            overflow: "hidden",
          }}
        >
          <Picker
            selectedValue={selectedMuscle}
            onValueChange={handleMuscleChange}
            dropdownIconColor="#fff"
            style={{ color: "#fff" }}
          >
            {MUSCLE_GROUPS.map((m) => (
              <Picker.Item key={m.value} label={m.label} value={m.value} />
            ))}
          </Picker>
        </View>

        {loading && (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 14 }} size="small" />
        )}

        {/* Suggestions list */}
        {suggestions.length > 0 && !exercise && (
          <View style={{ marginTop: 12 }}>
            <Text style={[commonStyles.mutedText, { marginBottom: 6 }]}>
              Tap an exercise to select it:
            </Text>
            {suggestions.slice(0, 10).map((ex, idx) => (
              <Pressable
                key={`${ex.name}-${idx}`}
                onPress={() => pickExercise(ex.name)}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>{ex.name}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                  {ex.type} · {ex.difficulty || "—"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {/* Step 2: Log form — only visible after exercise is picked */}
      {exercise !== "" && (
        <Card>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text style={commonStyles.h2}>Log Set</Text>
            <Pressable onPress={clearSelection}>
              <Text style={{ color: COLORS.primary, fontSize: 13, fontWeight: "600" }}>
                Change Exercise
              </Text>
            </Pressable>
          </View>

          <Text
            style={{
              color: COLORS.primary,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            {exercise}
          </Text>

          <View style={commonStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>Sets</Text>
              <TextInput
                style={commonStyles.input}
                value={sets}
                onChangeText={setSets}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>Reps</Text>
              <TextInput
                style={commonStyles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>Weight (lbs)</Text>
              <TextInput
                style={commonStyles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Pressable onPress={addStrength} style={[commonStyles.btn, { marginTop: 14 }]}>
            <Text style={commonStyles.btnText}>Log Strength</Text>
          </Pressable>
        </Card>
      )}

      {/* Recent logs */}
      <Card>
        <Text style={commonStyles.h2}>Recent</Text>
        {logs.length === 0 ? (
          <Text style={commonStyles.mutedText}>No lifts logged yet.</Text>
        ) : (
          logs.slice(0, 20).map((log) => (
            <View
              key={log.id}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ color: COLORS.text, fontWeight: "800" }}>{log.exercise}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                {log.sets}x{log.reps} @ {log.weight} lbs
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}