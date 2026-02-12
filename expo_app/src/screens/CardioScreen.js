import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";

import Card from "../components/Card";
import { commonStyles } from "../ui/layout";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";

const ACTIVITY_OPTIONS = ["Run", "Walk", "Bike", "Treadmill", "Stairs", "Other"];

function haversineMiles(a, b) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 3958.8; // miles
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
  const [route, setRoute] = useState([]); // array of coords
  const [startTime, setStartTime] = useState(null);

  const watchRef = useRef(null);

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

  const liveMinutes = useMemo(() => {
    if (!startTime) return 0;
    const ms = Date.now() - startTime;
    return Math.max(0, Math.round(ms / 60000));
  }, [startTime, tracking, route]);

  async function startTracking() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow location permission to track your run.");
      return;
    }

    setRoute([]);
    setStartTime(Date.now());
    setTracking(true);

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
    setTracking(false);

    // auto-fill the input fields so you DON'T retype
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
      id: `${Date.now()}`, // unique key
      time: new Date().toISOString(),
      activity,
      duration: d,
      distance: dist,
      route, // optional (can be empty if manual)
    };

    setLogs((prev) => [newLog, ...prev].slice(0, 50));
    setRoute([]);
    setStartTime(null);
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Card>
        <Text style={commonStyles.h2}>Cardio</Text>

        <Text style={commonStyles.label}>Activity</Text>
        <View
          style={{
            backgroundColor: "#121212",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#222",
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

        <View style={[commonStyles.row, { marginTop: 12 }]}>
          <Pressable
            onPress={tracking ? stopTracking : startTracking}
            style={[
              commonStyles.btn,
              { flex: 1, backgroundColor: tracking ? "#ff4d4d" : "#4da3ff" },
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

        <Text style={[commonStyles.mutedText, { marginTop: 10 }]}>
          Live: {tracking ? `${liveMinutes} min · ${liveMiles} mi` : "—"}
        </Text>
      </Card>

      <Card>
        <Text style={commonStyles.h2}>Recent</Text>

        {logs.length === 0 ? (
          <Text style={commonStyles.mutedText}>No cardio logged yet.</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#222" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {log.activity}
              </Text>
              <Text style={{ color: "#aaa", marginTop: 2 }}>
                {log.duration} min · {log.distance} mi
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
