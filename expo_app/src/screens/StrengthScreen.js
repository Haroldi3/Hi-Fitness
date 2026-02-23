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
import Card from "../components/Card";
import { commonStyles } from "../theme/layout";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";
import { fetchExercises } from "../api/exercises";

const MUSCLE_GROUPS = [
  "chest",
  "biceps",
  "triceps",
  "lats",
  "middle_back",
  "lower_back",
  "shoulders",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abdominals",
  "forearms",
  "traps",
];

export default function StrengthScreen() {
  const [exercise, setExercise] = useState("Bench Press");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("8");
  const [weight, setWeight] = useState("50");
  const [logs, setLogs] = useState([]);

  // Exercise suggestion state
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  async function loadSuggestions(muscle) {
    setSelectedMuscle(muscle);
    setLoadingSuggestions(true);
    setSuggestions([]);
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
      setLoadingSuggestions(false);
    }
  }

  function pickSuggestion(name) {
    setExercise(name);
    setSuggestions([]);
    setSelectedMuscle(null);
  }

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
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.content}
    >
      {/* ── Exercise Suggestions (API-powered) ── */}
      <Card>
        <Text style={commonStyles.h2}>Find Exercises</Text>
        <Text style={[commonStyles.mutedText, { marginBottom: 8 }]}>
          Tap a muscle group to get exercise ideas:
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {MUSCLE_GROUPS.map((m) => (
            <Pressable
              key={m}
              onPress={() => loadSuggestions(m)}
              style={{
                backgroundColor: selectedMuscle === m ? "#4da3ff" : "#1a1a1a",
                borderWidth: 1,
                borderColor: selectedMuscle === m ? "#4da3ff" : "#333",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  color: selectedMuscle === m ? "#000" : "#ccc",
                  fontSize: 13,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {m.replace("_", " ")}
              </Text>
            </Pressable>
          ))}
        </View>

        {loadingSuggestions && (
          <ActivityIndicator
            color="#4da3ff"
            style={{ marginTop: 14 }}
            size="small"
          />
        )}

        {suggestions.length > 0 && (
          <View style={{ marginTop: 12 }}>
            {suggestions.slice(0, 8).map((ex, idx) => (
              <Pressable
                key={`${ex.name}-${idx}`}
                onPress={() => pickSuggestion(ex.name)}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#222",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {ex.name}
                </Text>
                <Text style={{ color: "#aaa", fontSize: 12, marginTop: 2 }}>
                  {ex.type} · {ex.difficulty || "—"}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>

      {/* ── Log Workout ── */}
      <Card>
        <Text style={commonStyles.h2}>Log Strength</Text>

        <Text style={commonStyles.label}>Exercise</Text>
        <TextInput
          style={commonStyles.input}
          value={exercise}
          onChangeText={setExercise}
        />

        <View style={[commonStyles.row, { marginTop: 10 }]}>
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
        </View>

        <Text style={commonStyles.label}>Weight (lbs)</Text>
        <TextInput
          style={commonStyles.input}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
        />

        <Pressable onPress={addStrength} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Log Strength</Text>
        </Pressable>
      </Card>

      {/* ── Recent Logs ── */}
      <Card>
        <Text style={commonStyles.h2}>Recent</Text>
        {logs.length === 0 ? (
          <Text style={commonStyles.mutedText}>No lifts logged yet.</Text>
        ) : (
          logs.map((log) => (
            <View
              key={log.id}
              style={{
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#222",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>
                {log.exercise}
              </Text>
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
