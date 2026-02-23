import React from "react";
import { View } from "react-native";
import { commonStyles } from "../theme/layout";

export default function Card({ children, style }) {
  return <View style={[commonStyles.card, style]}>{children}</View>;
}