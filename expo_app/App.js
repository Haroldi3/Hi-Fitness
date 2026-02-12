import * as React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import ProfileScreen from "./src/screens/ProfileScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import CardioScreen from "./src/screens/CardioScreen";
import StrengthScreen from "./src/screens/StrengthScreen";
import TrailsScreen from "./src/screens/TrailsScreen";

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
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} />
        <Tab.Screen name="Cardio" component={CardioScreen} />
        <Tab.Screen name="Strength" component={StrengthScreen} />
        <Tab.Screen name="Trails" component={TrailsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
