import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";
import { calculateBMR, calculateTDEE, adjustCalories } from "../utils/healthMath";
import { todayKey } from "../utils/date";

const SCREEN_W = Dimensions.get("window").width;

/* ───── tiny calendar strip (current week) ───── */
function WeekStrip() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOfWeek + i);
    days.push(d);
  }
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const todayDate = today.getDate();

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
      {days.map((d, i) => {
        const isToday = d.getDate() === todayDate && d.getMonth() === today.getMonth();
        return (
          <View
            key={i}
            style={{
              alignItems: "center",
              backgroundColor: isToday ? COLORS.primary : "transparent",
              borderRadius: 10,
              paddingVertical: 6,
              paddingHorizontal: 8,
              minWidth: 36,
            }}
          >
            <Text style={{ color: isToday ? "#000" : COLORS.muted, fontSize: 11, fontWeight: "600" }}>
              {dayLabels[i]}
            </Text>
            <Text
              style={{
                color: isToday ? "#000" : COLORS.text,
                fontSize: 15,
                fontWeight: isToday ? "900" : "500",
                marginTop: 2,
              }}
            >
              {d.getDate()}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/* ───── haversine (copied from CardioScreen) ───── */
function haversineMiles(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ───── main screen ───── */
export default function HomeScreen() {
  const [profile, setProfile] = useState(null);
  const [nutritionToday, setNutritionToday] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [strengthLogs, setStrengthLogs] = useState([]);
  const [cardioLogs, setCardioLogs] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);

  // Quick cardio
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const watchRef = useRef(null);
  const timerRef = useRef(null);

  const today = todayKey();

  // Load everything on mount
  const loadData = useCallback(async () => {
    const p = await loadJSON(STORAGE_KEYS.profile);
    if (p) setProfile(p);

    const nt = await loadJSON(`${STORAGE_KEYS.nutritionDay}_${today}`);
    if (nt) setNutritionToday(nt);

    const sl = await loadJSON(STORAGE_KEYS.strengthLog);
    if (sl && Array.isArray(sl)) setStrengthLogs(sl);

    const cl = await loadJSON(STORAGE_KEYS.cardioLog);
    if (cl && Array.isArray(cl)) setCardioLogs(cl);

    const wh = await loadJSON(STORAGE_KEYS.weightHistory);
    if (wh && Array.isArray(wh)) setWeightHistory(wh);
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calorie target from profile
  const calorieTarget = useMemo(() => {
    if (!profile) return 2000;
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activity || "Moderately Active");
    return Math.round(adjustCalories(tdee, profile.goal || "Maintain"));
  }, [profile]);

  // Workout of the day — latest strength log from today
  const todayWorkouts = useMemo(() => {
    return strengthLogs.filter((l) => l.time && l.time.startsWith(today));
  }, [strengthLogs, today]);

  // Today's cardio
  const todayCardio = useMemo(() => {
    return cardioLogs.filter((l) => l.time && l.time.startsWith(today));
  }, [cardioLogs, today]);

  // Weight trend — last 7 entries
  const recentWeights = useMemo(() => {
    return weightHistory.slice(-7);
  }, [weightHistory]);

  const weightChange = useMemo(() => {
    if (recentWeights.length < 2) return null;
    const first = recentWeights[0].weight;
    const last = recentWeights[recentWeights.length - 1].weight;
    return Math.round((last - first) * 10) / 10;
  }, [recentWeights]);

  // Live distance for quick cardio
  const liveMiles = useMemo(() => {
    if (route.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += haversineMiles(route[i - 1], route[i]);
    }
    return Math.round(total * 100) / 100;
  }, [route]);

  const liveMinutes = useMemo(() => {
    return Math.floor(elapsed / 60);
  }, [elapsed]);

  const liveSeconds = useMemo(() => {
    return elapsed % 60;
  }, [elapsed]);

  async function startQuickCardio() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow location to track your run.");
      return;
    }

    setRoute([]);
    setStartTime(Date.now());
    setElapsed(0);
    setTracking(true);

    // Timer
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
      (pos) => {
        setRoute((prev) => [
          ...prev,
          { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        ]);
      }
    );
  }

  async function stopQuickCardio() {
    if (watchRef.current) {
      await watchRef.current.remove();
      watchRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTracking(false);

    if (liveMinutes > 0 || liveMiles > 0) {
      const newLog = {
        id: `${Date.now()}`,
        time: new Date().toISOString(),
        activity: "Quick Run",
        duration: liveMinutes || 1,
        distance: liveMiles,
        route,
      };
      const updated = [newLog, ...cardioLogs].slice(0, 50);
      setCardioLogs(updated);
      await saveJSON(STORAGE_KEYS.cardioLog, updated);
      Alert.alert("Saved!", `${liveMinutes}m · ${liveMiles} mi logged.`);
    }
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* Greeting + Calendar */}
      <Card>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>
          Hey, {profile?.name || "there"} 👋
        </Text>
        <WeekStrip />
      </Card>

      {/* Macros Overview */}
      <Card>
        <Text style={commonStyles.h2}>Today's Nutrition</Text>
        <ProgressBar
          label="Calories"
          value={nutritionToday.calories}
          goal={calorieTarget}
          suffix=" kcal"
        />
        <ProgressBar label="Protein" value={nutritionToday.protein} goal={150} suffix="g" />
        <ProgressBar label="Carbs" value={nutritionToday.carbs} goal={250} suffix="g" />
        <ProgressBar label="Fat" value={nutritionToday.fat} goal={65} suffix="g" />
      </Card>

      {/* Quick Cardio */}
      <Card>
        <Text style={commonStyles.h2}>Quick Cardio</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 10 }}>
          Start tracking without leaving the home screen
        </Text>

        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Text
            style={{
              color: tracking ? COLORS.primary : COLORS.text,
              fontSize: 36,
              fontWeight: "900",
              fontVariant: ["tabular-nums"],
            }}
          >
            {pad(liveMinutes)}:{pad(liveSeconds)}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 2 }}>
            {liveMiles} mi
          </Text>
        </View>

        <Pressable
          onPress={tracking ? stopQuickCardio : startQuickCardio}
          style={[
            commonStyles.btn,
            { backgroundColor: tracking ? COLORS.danger : COLORS.primary },
          ]}
        >
          <Text style={commonStyles.btnText}>
            {tracking ? "Stop & Save" : "Start Run / Bike"}
          </Text>
        </Pressable>
      </Card>

      {/* Workout of the Day */}
      <Card>
        <Text style={commonStyles.h2}>Today's Workouts</Text>
        {todayWorkouts.length === 0 && todayCardio.length === 0 ? (
          <Text style={commonStyles.mutedText}>No workouts logged today — get moving!</Text>
        ) : (
          <>
            {todayWorkouts.map((log) => (
              <View
                key={log.id}
                style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
              >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>{log.exercise}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                  {log.sets}x{log.reps} @ {log.weight} lbs
                </Text>
              </View>
            ))}
            {todayCardio.map((log) => (
              <View
                key={log.id}
                style={{ paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
              >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>{log.activity}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                  {log.duration} min · {log.distance} mi
                </Text>
              </View>
            ))}
          </>
        )}
      </Card>

      {/* Weight Progress */}
      <Card>
        <Text style={commonStyles.h2}>Weight Progress</Text>
        {recentWeights.length === 0 ? (
          <Text style={commonStyles.mutedText}>No weight entries yet.</Text>
        ) : (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "900" }}>
                {recentWeights[recentWeights.length - 1].weight} lbs
              </Text>
              {weightChange !== null && (
                <Text
                  style={{
                    color: weightChange > 0 ? "#4ade80" : weightChange < 0 ? COLORS.danger : COLORS.muted,
                    fontSize: 16,
                    fontWeight: "700",
                    alignSelf: "center",
                  }}
                >
                  {weightChange > 0 ? "+" : ""}
                  {weightChange} lbs
                </Text>
              )}
            </View>

            {/* Mini bar chart of recent weights */}
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: 60, gap: 4, marginTop: 4 }}>
              {(() => {
                const weights = recentWeights.map((w) => w.weight);
                const min = Math.min(...weights) - 2;
                const max = Math.max(...weights) + 2;
                const range = max - min || 1;
                return recentWeights.map((entry, i) => {
                  const pct = ((entry.weight - min) / range) * 100;
                  return (
                    <View key={i} style={{ flex: 1, alignItems: "center" }}>
                      <View
                        style={{
                          width: "80%",
                          height: `${Math.max(pct, 10)}%`,
                          backgroundColor: COLORS.primary,
                          borderRadius: 4,
                        }}
                      />
                      <Text style={{ color: COLORS.muted, fontSize: 9, marginTop: 2 }}>
                        {entry.date.slice(5)}
                      </Text>
                    </View>
                  );
                });
              })()}
            </View>
          </>
        )}
      </Card>
    </ScrollView>
  );
}
