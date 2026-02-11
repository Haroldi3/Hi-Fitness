import React, { useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";

import Card from "../components/Card";
import { layout } from "../theme/layout";

export default function TrailsScreen() {
  const [lat, setLat] = useState("40.7128");
  const [lng, setLng] = useState("-74.0060");
  const [results, setResults] = useState([]);

  const onFind = async () => {
    // placeholder until you wire Places/Trails API
    setResults([{ name: "Example Park", address: "Coming soon..." }]);
  };

  return (
    <ScrollView style={layout.screen} contentContainerStyle={layout.content}>
      <Card>
        <Text style={layout.h2}>Nearby Trails / Parks</Text>

        <Text style={layout.label}>Latitude</Text>
        <TextInput style={layout.input} value={lat} onChangeText={setLat} keyboardType="decimal-pad" />

        <Text style={layout.label}>Longitude</Text>
        <TextInput style={layout.input} value={lng} onChangeText={setLng} keyboardType="decimal-pad" />

        <Pressable style={layout.button} onPress={onFind}>
          <Text style={layout.buttonText}>Find Places</Text>
        </Pressable>
      </Card>

      <Card>
        <Text style={layout.h2}>Results</Text>
        {results.length === 0 ? (
          <Text style={layout.muted}>No places yet.</Text>
        ) : (
          results.map((r, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>{r.name}</Text>
              <Text style={layout.muted}>{r.address}</Text>
              <View style={layout.divider} />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}
