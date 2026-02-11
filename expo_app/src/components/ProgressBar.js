import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProgressBar({ label, value, goal, suffix = "" }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}{suffix} / {Math.round(goal)}{suffix}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { fontWeight: "600" },
  value: { color: "#374151" },
  track: { height: 10, borderRadius: 8, backgroundColor: "#e5e7eb", overflow: "hidden" },
  fill: { height: 10, backgroundColor: "#111827" },
});
