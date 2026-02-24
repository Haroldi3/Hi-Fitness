import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Card from "../components/Card";
import { commonStyles } from "../theme/layout";
import { COLORS } from "../theme/colors";
import { STORAGE_KEYS } from "../storage/keys";
import { saveJSON } from "../storage/store";

export default function OnboardingScreen({ onFinish }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("Moderately Active");
  const [goal, setGoal] = useState("Maintain");

  async function handleCreate() {
    if (!name.trim()) return Alert.alert("Missing", "Enter your name.");
    if (!age || Number(age) <= 0) return Alert.alert("Missing", "Enter a valid age.");
    if (!height || Number(height) <= 0) return Alert.alert("Missing", "Enter your height.");
    if (!weight || Number(weight) <= 0) return Alert.alert("Missing", "Enter your weight.");

    const profile = {
      name: name.trim(),
      age: Number(age),
      gender,
      height: Number(height),
      weight: Number(weight),
      activity,
      goal,
    };

    await saveJSON(STORAGE_KEYS.profile, profile);
    // Save initial weight entry
    await saveJSON(STORAGE_KEYS.weightHistory, [
      { date: new Date().toISOString().slice(0, 10), weight: Number(weight) },
    ]);
    await saveJSON(STORAGE_KEYS.onboarded, true);

    onFinish();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.content, { paddingTop: 60 }]}
      >
        <Text
          style={{
            color: COLORS.primary,
            fontSize: 28,
            fontWeight: "900",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Hi Fitness
        </Text>
        <Text
          style={{
            color: COLORS.muted,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Create your profile to get started
        </Text>

        <Card>
          <Text style={commonStyles.label}>Name</Text>
          <TextInput
            style={commonStyles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#666"
          />

          <View style={[commonStyles.row, { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>Age</Text>
              <TextInput
                style={commonStyles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="24"
                placeholderTextColor="#666"
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
                placeholder="70"
                placeholderTextColor="#666"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>Weight (lbs)</Text>
              <TextInput
                style={commonStyles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="number-pad"
                placeholder="155"
                placeholderTextColor="#666"
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

          <Pressable onPress={handleCreate} style={[commonStyles.btn, { marginTop: 20 }]}>
            <Text style={commonStyles.btnText}>Create Profile</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
