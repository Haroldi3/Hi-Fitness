import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Card from "../components/Card";
import { layout } from "../theme/layout";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cardioLog";

export default function CardioScreen() {
  const [activity, setActivity] = useState("Run");
  const [duration, setDuration] = useState("30");
  const [distance, setDistance] = useState("3");
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
      activity,
      duration: Number(duration || 0),
      distance: Number(distance || 0),
      ts: Date.now(),
    };
    await save([entry, ...items]);
  };

  return (
    <ScrollView style={layout.screen} contentContainerStyle={layout.content}>
      <Card>
        <Text style={layout.h2}>Cardio</Text>

        <Text style={layout.label}>Activity</Text>
        <View style={layout.pickerWrap}>
          <Picker
            selectedValue={activity}
            onValueChange={setActivity}
            style={{ color: "#fff" }}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Run" value="Run" />
            <Picker.Item label="Walk" value="Walk" />
            <Picker.Item label="Bike" value="Bike" />
            <Picker.Item label="Treadmill" value="Treadmill" />
            <Picker.Item label="Stairmaster" value="Stairmaster" />
          </Picker>
        </View>

        <View style={[layout.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Duration (min)</Text>
            <TextInput
              style={layout.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Distance (mi)</Text>
            <TextInput
              style={layout.input}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Pressable style={layout.button} onPress={onLog}>
          <Text style={layout.buttonText}>Log Cardio</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={layout.h2}>Recent</Text>
        {items.length === 0 ? (
          <Text style={layout.muted}>No cardio logged yet.</Text>
        ) : (
          items.slice(0, 10).map((x) => (
            <View key={x.ts} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "800" }}>{x.activity}</Text>
              <Text style={layout.muted}>
                {x.duration} min • {x.distance} mi
              </Text>
              <View style={layout.divider} />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

