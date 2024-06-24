import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HotspotItem from "../components/HotspotItem.js";

const HotspotListScreen = ({ navigation }) => {
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const loadHotspots = async () => {
      try {
        const storedHotspots = await AsyncStorage.getItem("hotspots");
        if (storedHotspots !== null) {
          const parsedHotspots = JSON.parse(storedHotspots);

          // Check for valid id property in each hotspot
          const validHotspots = parsedHotspots.map((hotspot, index) => ({
            ...hotspot,
            id: hotspot.id || index.toString(), // Ensure each hotspot has a unique id
          }));

          setHotspots(validHotspots);
        }
      } catch (error) {
        console.error("Error loading hotspots:", error);
        Alert.alert("Error", "There was an error loading the hotspots.");
      }
    };

    loadHotspots();
  }, []);

  const renderItem = ({ item }) => (
    <HotspotItem
      item={item}
      onPress={() => navigation.navigate("Map", { hotspot: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={hotspots}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default HotspotListScreen;
