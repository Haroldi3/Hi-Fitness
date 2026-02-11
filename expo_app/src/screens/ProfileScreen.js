import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Card from "../components/Card";
import { layout } from "../theme/layout";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";

export default function ProfileScreen() {
  const [name, setName] = useState("Harold");
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("70");
  const [weight, setWeight] = useState("155");
  const [activity, setActivity] = useState("");

  useEffect(() => {
    (async () => {
      const saved = await loadJSON(STORAGE_KEYS.profile);
      if (saved) {
        setName(saved.name ?? "");
        setAge(String(saved.age ?? ""));
        setGender(saved.gender ?? "");
        setHeight(String(saved.height ?? ""));
        setWeight(String(saved.weight ?? ""));
        setActivity(saved.activity ?? "");
      }
    })();
  }, []);

  const payload = useMemo(
    () => ({ name, age, gender, height, weight, activity }),
    [name, age, gender, height, weight, activity]
  );

  useEffect(() => {
    saveJSON(STORAGE_KEYS.profile, payload);
  }, [payload]);

  return (
    <ScrollView style={layout.screen} contentContainerStyle={layout.content}>
      <Card>
        <Text style={layout.h2}>Profile</Text>

        <Text style={layout.label}>Name</Text>
        <TextInput style={layout.input} value={name} onChangeText={setName} />

        <View style={[layout.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Age</Text>
            <TextInput
              style={layout.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Gender</Text>

            <View style={layout.pickerWrap}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={{ color: "#fff" }}
                dropdownIconColor="#fff"
              >
                <Picker.Item label="Select..." value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={[layout.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Height (in)</Text>
            <TextInput
              style={layout.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={layout.label}>Weight (lbs)</Text>
            <TextInput
              style={layout.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={layout.label}>Activity</Text>
        <TextInput
          style={layout.input}
          value={activity}
          onChangeText={setActivity}
          placeholder="e.g., Gym 5x/week"
          placeholderTextColor="#6B7280"
        />
      </Card>
    </ScrollView>
  );
}
