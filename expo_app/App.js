import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import CardioScreen from "./src/screens/CardioScreen";
import StrengthScreen from "./src/screens/StrengthScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

import { STORAGE_KEYS } from "./src/storage/keys";
import { loadJSON } from "./src/storage/store";

const Tab = createBottomTabNavigator();

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#000000",
    card: "#0b0b0b",
    text: "#ffffff",
    border: "#222222",
    primary: "#4da3ff",
    notification: "#4da3ff",
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const val = await loadJSON(STORAGE_KEYS.onboarded);
      setOnboarded(val === true);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#4da3ff" size="large" />
      </View>
    );
  }

  if (!onboarded) {
    return <OnboardingScreen onFinish={() => setOnboarded(true)} />;
  }

  return (
    <NavigationContainer theme={MyDarkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarStyle: { backgroundColor: "#0b0b0b", borderTopColor: "#222" },
          tabBarActiveTintColor: "#4da3ff",
          tabBarInactiveTintColor: "#777",
          headerStyle: { backgroundColor: "#0b0b0b" },
          headerTitleStyle: { color: "#fff" },
          headerTintColor: "#fff",
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} />
        <Tab.Screen name="Cardio" component={CardioScreen} />
        <Tab.Screen name="Strength" component={StrengthScreen} />
        <Tab.Screen name="Settings">
          {() => <SettingsScreen onLogout={() => setOnboarded(false)} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
