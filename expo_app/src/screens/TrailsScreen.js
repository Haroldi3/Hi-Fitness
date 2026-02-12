import React, { useState } from "react";
import { ScrollView, Text, View, Pressable, Alert } from "react-native";
import * as Location from "expo-location";
import Card from "../components/Card";
import { commonStyles } from "../ui/layout";

export default function TrailsScreen() {
  const [coords, setCoords] = useState(null);

  async function getMyLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow location permission.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setCoords({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    });
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.content}>
      <Card>
        <Text style={commonStyles.h2}>Trails / Parks</Text>

        <Pressable onPress={getMyLocation} style={commonStyles.btn}>
          <Text style={commonStyles.btnText}>Use My GPS Location</Text>
        </Pressable>

        <View style={{ marginTop: 12 }}>
          <Text style={commonStyles.mutedText}>
            Latitude: {coords ? coords.latitude.toFixed(6) : "—"}
          </Text>
          <Text style={commonStyles.mutedText}>
            Longitude: {coords ? coords.longitude.toFixed(6) : "—"}
          </Text>
          <Text style={[commonStyles.mutedText, { marginTop: 8 }]}>
            Next step: connect to Places API (Google Places / Yelp / OpenStreetMap).
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}
