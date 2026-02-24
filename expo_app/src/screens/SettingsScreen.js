import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Card from "../components/Card";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { STORAGE_KEYS } from "../storage/keys";
import { loadJSON, saveJSON } from "../storage/store";

export default function SettingsScreen({ onLogout }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("Moderately Active");
  const [goal, setGoal] = useState("Maintain");

  // Weight logging
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    (async () => {
      const saved = await loadJSON(STORAGE_KEYS.profile);
      if (saved) {
        setName(saved.name ?? "");
        setAge(String(saved.age ?? ""));
        setGender(saved.gender ?? "Male");
        setHeight(String(saved.height ?? ""));
        setWeight(String(saved.weight ?? ""));
        setActivity(saved.activity ?? "Moderately Active");
        setGoal(saved.goal ?? "Maintain");
      }
    })();
  }, []);

  async function handleSave() {
    const profile = {
      name: name.trim(),
      age: Number(age) || 0,
      gender,
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      activity,
      goal,
    };
    await saveJSON(STORAGE_KEYS.profile, profile);
    Alert.alert("Saved", "Profile updated.");
  }

  async function handleLogWeight() {
    const w = Number(newWeight);
    if (!w || w <= 0) return Alert.alert("Invalid", "Enter a valid weight.");

    const history = (await loadJSON(STORAGE_KEYS.weightHistory)) || [];
    const today = new Date().toISOString().slice(0, 10);

    // Replace today's entry if it exists, otherwise push
    const idx = history.findIndex((e) => e.date === today);
    if (idx >= 0) {
      history[idx].weight = w;
    } else {
      history.push({ date: today, weight: w });
    }

    await saveJSON(STORAGE_KEYS.weightHistory, history);

    // Also update profile weight
    setWeight(String(w));
    const profile = await loadJSON(STORAGE_KEYS.profile);
    if (profile) {
      profile.weight = w;
      await saveJSON(STORAGE_KEYS.profile, profile);
    }

    setNewWeight("");
    Alert.alert("Logged", `Weight ${w} lbs saved for today.`);
  }

  function handleLogout() {
    Alert.alert(
      "Reset Profile",
      "This will clear your profile and show the setup screen again. Your workout and nutrition data will be kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await saveJSON(STORAGE_KEYS.onboarded, false);
            if (onLogout) onLogout();
          },
        },
      ]
    );
  }

  const bmi = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return null;
    return Math.round(((w / (h * h)) * 703) * 10) / 10;
  }, [height, weight]);

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      {/* Profile Edit */}
      <Card>
        <Text style={commonStyles.h2}>Edit Profile</Text>

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
                backgroundColor: COLORS.inputBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
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

        <Text style={commonStyles.label}>Activity Level</Text>
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
            <Picker.Item label="Sedentary" value="Sedentary" />
            <Picker.Item label="Lightly Active" value="Lightly Active" />
            <Picker.Item label="Moderately Active" value="Moderately Active" />
            <Picker.Item label="Very Active" value="Very Active" />
            <Picker.Item label="Extremely Active" value="Extremely Active" />
          </Picker>
        </View>

        <Text style={commonStyles.label}>Goal</Text>
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
            selectedValue={goal}
            onValueChange={setGoal}
            dropdownIconColor="#fff"
            style={{ color: "#fff" }}
          >
            <Picker.Item label="Lose Weight" value="Lose Weight" />
            <Picker.Item label="Maintain" value="Maintain" />
            <Picker.Item label="Gain Weight" value="Gain Weight" />
          </Picker>
        </View>

        {bmi && (
          <Text style={[commonStyles.mutedText, { marginTop: 10 }]}>BMI: {bmi}</Text>
        )}

        <Pressable onPress={handleSave} style={[commonStyles.btn, { marginTop: 14 }]}>
          <Text style={commonStyles.btnText}>Save Profile</Text>
        </Pressable>
      </Card>

      {/* Log Weight */}
      <Card>
        <Text style={commonStyles.h2}>Log Today's Weight</Text>
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={commonStyles.input}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
              placeholder="e.g. 153"
              placeholderTextColor="#666"
            />
          </View>
          <Pressable onPress={handleLogWeight} style={[commonStyles.btn, { flex: 0.5, marginTop: 0 }]}>
            <Text style={commonStyles.btnText}>Log</Text>
          </Pressable>
        </View>
      </Card>

      {/* Reset */}
      <Card>
        <Text style={commonStyles.h2}>Account</Text>
        <Pressable
          onPress={handleLogout}
          style={[commonStyles.btn, { backgroundColor: COLORS.danger }]}
        >
          <Text style={[commonStyles.btnText, { color: "#fff" }]}>Reset Profile</Text>
        </Pressable>
        <Text style={[commonStyles.mutedText, { marginTop: 8, fontSize: 12 }]}>
          This will bring back the setup screen. Your workout data is kept.
        </Text>
      </Card>
    </ScrollView>
  );
}
