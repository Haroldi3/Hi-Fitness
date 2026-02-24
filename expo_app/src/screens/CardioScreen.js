import React, { useEffect, useMemo, useRef, useState } from "react";
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
import * as Location from "expo-location";

import Card from "../components/Card";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";
import { fetchTrails } from "../api/places";

const ACTIVITY_OPTIONS = ["Run", "Walk", "Bike", "Treadmill", "Stairs", "Other"];

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

export default function CardioScreen() {
  const [activity, setActivity] = useState("Run");
  const [duration, setDuration] = useState("30");
  const [distance, setDistance] = useState("3");
  const [logs, setLogs] = useState([]);

  // GPS tracking
  const [tracking, setTracking] = useState(false);
  const [route, setRoute] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const watchRef = useRef(null);
  const timerRef = useRef(null);

  // Trails
  const [trails, setTrails] = useState([]);
  const [trailsLoading, setTrailsLoading] = useState(false);
  const [trailCoords, setTrailCoords] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await loadJSON(STORAGE_KEYS.cardioLog);
      if (saved && Array.isArray(saved)) setLogs(saved);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await saveJSON(STORAGE_KEYS.cardioLog, logs);
    })();
  }, [logs]);

  const liveMiles = useMemo(() => {
    if (route.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < route.length; i++) {
      total += haversineMiles(route[i - 1], route[i]);
    }
    return Math.round(total * 100) / 100;
  }, [route]);

  const liveMinutes = useMemo(() => Math.floor(elapsed / 60), [elapsed]);
  const liveSeconds = useMemo(() => elapsed % 60, [elapsed]);

  async function startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow location permission to track your run.");
      return;
    }

    setRoute([]);
    setStartTime(Date.now());
    setElapsed(0);
    setTracking(true);

    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (pos) => {
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setRoute((prev) => [...prev, coord]);
      }
    );
  }

  async function stopTracking() {
    if (watchRef.current) {
      await watchRef.current.remove();
      watchRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTracking(false);

    if (liveMiles > 0) setDistance(String(liveMiles));
    if (liveMinutes > 0) setDuration(String(liveMinutes));
  }

  function addLog() {
    const d = Number(duration);
    const dist = Number(distance);

    if (!activity) return Alert.alert("Missing", "Pick an activity.");
    if (!d || d <= 0) return Alert.alert("Invalid", "Duration must be > 0.");
    if (!dist || dist <= 0) return Alert.alert("Invalid", "Distance must be > 0.");

    const newLog = {
      id: `${Date.now()}`,
      time: new Date().toISOString(),
      activity,
      duration: d,
      distance: dist,
      route,
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 50));
    setRoute([]);
    setStartTime(null);
    setElapsed(0);
  }

  // ── Trails ──
  async function findTrails() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow location permission.");
      return;
    }

    setTrailsLoading(true);
    try {
      const pos = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setTrailCoords(coords);

      const places = await fetchTrails({
        lat: coords.latitude,
        lon: coords.longitude,
      });
      setTrails(places);
      if (!places.length) {
        Alert.alert("No trails", "No trails or parks found nearby. Try a wider area.");
      }
    } catch (e) {
      console.log("Trails error:", e?.message || e);
      Alert.alert(
        "Trails lookup failed",
        "Check that your backend is running and GEOAPIFY_KEY is set in .env."
      );
    } finally {
      setTrailsLoading(false);
    }
  }

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* Cardio Tracker */}
      <Card>
        <Text style={commonStyles.h2}>Cardio</Text>

        <Text style={commonStyles.label}>Activity</Text>
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
            selectedValue={activity}
            onValueChange={setActivity}
            dropdownIconColor="#fff"
            style={{ color: "#fff" }}
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>

        <View style={[commonStyles.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Duration (min)</Text>
            <TextInput
              style={commonStyles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Distance (mi)</Text>
            <TextInput
              style={commonStyles.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Live timer */}
        {tracking && (
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <Text
              style={{
                color: COLORS.primary,
                fontSize: 32,
                fontWeight: "900",
                fontVariant: ["tabular-nums"],
              }}
            >
              {pad(liveMinutes)}:{pad(liveSeconds)}
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>
              {liveMiles} mi
            </Text>
          </View>
        )}

        <View style={[commonStyles.row, { marginTop: 12 }]}>
          <Pressable
            onPress={tracking ? stopTracking : startTracking}
            style={[
              commonStyles.btn,
              { flex: 1, backgroundColor: tracking ? COLORS.danger : COLORS.primary },
            ]}
          >
            <Text style={commonStyles.btnText}>
              {tracking ? "Stop GPS" : "Start GPS"}
            </Text>
          </Pressable>

          <Pressable onPress={addLog} style={[commonStyles.btn, { flex: 1 }]}>
            <Text style={commonStyles.btnText}>Log Cardio</Text>
          </Pressable>
        </View>
      </Card>

      {/* Trails / Parks */}
      <Card>
        <Text style={commonStyles.h2}>Trails / Parks Nearby</Text>

        <Pressable onPress={findTrails} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Find Trails Near Me</Text>
        </Pressable>

        {trailsLoading && (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 14 }} size="small" />
        )}

        {trailCoords && (
          <Text style={[commonStyles.mutedText, { marginTop: 8, fontSize: 11 }]}>
            📍 {trailCoords.latitude.toFixed(4)}, {trailCoords.longitude.toFixed(4)}
          </Text>
        )}

        {trails.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {trails.map((place, idx) => (
              <View
                key={`trail-${idx}`}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.border,
                }}
              >
                <Text style={{ color: COLORS.text, fontWeight: "700" }}>{place.name}</Text>
                {place.address ? (
                  <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                    {place.address}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Recent Logs */}
      <Card>
        <Text style={commonStyles.h2}>Recent</Text>

        {logs.length === 0 ? (
          <Text style={commonStyles.mutedText}>No cardio logged yet.</Text>
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
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {log.activity}
              </Text>
              <Text style={{ color: COLORS.muted, marginTop: 2 }}>
                {log.duration} min · {log.distance} mi
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
