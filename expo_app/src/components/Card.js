import React from "react";
import { View } from "react-native";
import { layout } from "../theme/layout";

export default function Card({ children, style }) {
  return <View style={[layout.card, style]}>{children}</View>;
}