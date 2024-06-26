import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from "expo-location";
import { fetchData } from "../utils/FetchApi.js";
import { useTheme } from "../hooks/useTheme.js"; // Import useTheme hook

const MapScreen = ({ route }) => {
  const { theme } = useTheme(); // Get the current theme
  const [hotspots, setHotspots] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);

  useEffect(() => {
    if (route.params?.selectedHotspot) {
      setSelectedHotspot(route.params.selectedHotspot);
    }

    const loadHotspots = async () => {
      try {
        const storedHotspots = await AsyncStorage.getItem('hotspots');
        if (storedHotspots) {
          setHotspots(JSON.parse(storedHotspots));
        } else {
          const data = await fetchData();
          setHotspots(data);
          await AsyncStorage.setItem('hotspots', JSON.stringify(data));
        }
      } catch (err) {
        setError(err.message);
        Alert.alert('Error loading hotspots', err.message, [{ text: 'OK' }]);
      } finally {
        setIsLoading(false);
      }
    };

    const getLocation = async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission denied');
        const { coords } = await getCurrentPositionAsync({});
        setLocation(coords);
      } catch (error) {
        setError(error.message);
        Alert.alert('Error getting location', error.message, [{ text: 'OK' }]);
      }
    };

    getLocation();
    loadHotspots();
  }, [route.params]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.textColor} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textColor }]}>Error: {error}</Text>
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedHotspot ? selectedHotspot.latitude : location?.latitude || 51.917404,
            longitude: selectedHotspot ? selectedHotspot.longitude : location?.longitude || 4.484861,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          region={{
            latitude: selectedHotspot ? selectedHotspot.latitude : location?.latitude || 51.917404,
            longitude: selectedHotspot ? selectedHotspot.longitude : location?.longitude || 4.484861,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {hotspots.map((hotspot, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: hotspot.latitude,
                longitude: hotspot.longitude,
              }}
              pinColor={selectedHotspot && selectedHotspot.id === hotspot.id ? 'blue' : 'red'}
            >
              <Callout>
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{hotspot.title}</Text>
                  <Text>{hotspot.description}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default MapScreen;
