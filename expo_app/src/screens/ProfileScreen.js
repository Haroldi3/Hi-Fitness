import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Card from "../components/Card";
import { commonStyles } from "../ui/layout";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";

export default function ProfileScreen() {
  const [name, setName] = useState("Harold");
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("70");
  const [weight, setWeight] = useState("155");
  const [activity, setActivity] = useState("");

  useEffect(() => {
    (async () => {
      const saved = await loadJSON(STORAGE_KEYS.profile);
      if (saved) {
        setName(saved.name ?? "");
        setAge(String(saved.age ?? ""));
        setGender(saved.gender ?? "Male");
        setHeight(String(saved.height ?? ""));
        setWeight(String(saved.weight ?? ""));
        setActivity(saved.activity ?? "");
      }
    })();
  }, []);

  // Auto-save when any field changes (no buttons needed)
  useEffect(() => {
    (async () => {
      await saveJSON(STORAGE_KEYS.profile, {
        name,
        age: Number(age) || age,
        gender,
        height: Number(height) || height,
        weight: Number(weight) || weight,
        activity,
      });
    })();
  }, [name, age, gender, height, weight, activity]);

  const bmi = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return null;
    // inches/lbs BMI: (lbs / in^2) * 703
    const val = (w / (h * h)) * 703;
    return Math.round(val * 10) / 10;
  }, [height, weight]);

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Card>
        <Text style={commonStyles.h2}>Profile</Text>

        <Text style={commonStyles.label}>Name</Text>
        <TextInput style={commonStyles.input} value={name} onChangeText={setName} />

        <View style={[commonStyles.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Age</Text>
            <TextInput
              style={commonStyles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Gender</Text>
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
                selectedValue={gender}
                onValueChange={setGender}
                dropdownIconColor="#fff"
                style={{ color: "#fff" }}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={[commonStyles.row, { marginTop: 10 }]}>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Height (in)</Text>
            <TextInput
              style={commonStyles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={commonStyles.label}>Weight (lbs)</Text>
            <TextInput
              style={commonStyles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <Text style={commonStyles.label}>Activity</Text>
        <TextInput
          style={commonStyles.input}
          value={activity}
          onChangeText={setActivity}
          placeholder="e.g., Gym 4x/week + Soccer"
          placeholderTextColor="#666"
        />

        <View style={commonStyles.divider} />

        <Text style={commonStyles.mutedText}>
          BMI: {bmi ? `${bmi}` : "—"}
        </Text>
        <Text style={commonStyles.mutedText}>
          Auto-saves to your phone storage ✅
        </Text>
      </Card>
    </ScrollView>
  );
}
