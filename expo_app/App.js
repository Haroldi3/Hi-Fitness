import * as React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import ProfileScreen from "./src/screens/ProfileScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import CardioScreen from "./src/screens/CardioScreen";
import StrengthScreen from "./src/screens/StrengthScreen";
import TrailsScreen from "./src/screens/TrailsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer theme={DarkTheme}>
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#000" },
            headerTintColor: "#fff",
            tabBarStyle: { backgroundColor: "#000", borderTopColor: "#111" },
            tabBarActiveTintColor: "#3B82F6",
            tabBarInactiveTintColor: "#9CA3AF",
          }}
        >
          <Tab.Screen name="Profile" component={ProfileScreen} />
          <Tab.Screen name="Nutrition" component={NutritionScreen} />
          <Tab.Screen name="Cardio" component={CardioScreen} />
          <Tab.Screen name="Strength" component={StrengthScreen} />
          <Tab.Screen name="Trails" component={TrailsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

