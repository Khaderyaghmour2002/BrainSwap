import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function LocationPickerScreen({ navigation }) {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&types=(cities)&key=AIzaSyDS2lHkwzsP0sPQD7oBqXPnHHjnOliuaRM`
      );
      const data = await response.json();
      if (data.status === "OK") {
        setSearchResults(
          data.predictions.map((prediction) => ({
            id: prediction.place_id,
            name: prediction.description,
          }))
        );
      } else {
        console.error("Error fetching suggestions:", data.error_message);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSearchResults([]);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
    } else {
      fetchSuggestions(query);
    }
  };

  const selectLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to select your current location."
        );
        setLoading(false);
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const currentLocation = {
        name: address.city || "Unknown City",
        country: address.country || "Unknown Country",
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      setSelectedLocation(currentLocation);
      setSearchQuery(`${currentLocation.name}, ${currentLocation.country}`);
      setRegion({
        ...region,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert("Error", "Failed to fetch location. Please try again.");
      setLoading(false);
    }
  };

  const saveLocation = () => {
    if (!selectedLocation) {
      Alert.alert("No Location Selected", "Please select a location first.");
      return;
    }
    Alert.alert(
      "Location Saved",
      `Your location: ${selectedLocation.name}, ${selectedLocation.country}`
    );
    navigation.goBack();
  };

  const handleSuggestionPress = (location) => {
    setSelectedLocation({
      name: location.name,
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setSearchQuery(location.name);
    setRegion({
      ...region,
      latitude: region.latitude,
      longitude: region.longitude,
    });
    setSearchResults([]);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Please select your location to proceed
        </Text>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a location..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={selectLocation}
        >
          <Text style={styles.currentLocationText}>Use Current Location</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
          >
            <Text style={styles.suggestionText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        style={styles.suggestionsList}
      />

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude || region.latitude,
              longitude: selectedLocation.longitude || region.longitude,
            }}
            title={selectedLocation.name}
            description={selectedLocation.country}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={[styles.saveButton, !selectedLocation && styles.disabledButton]}
        onPress={saveLocation}
        disabled={!selectedLocation}
      >
        <Text style={styles.saveButtonText}>Save Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    
    padding: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  headerText: {
    marginTop: 303,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchSection: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    elevation: 2,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  currentLocationButton: {
    alignItems: "center",
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  currentLocationText: {
    color: "#fff",
    fontWeight: "bold",
  },
  suggestionsList: {
    maxHeight: 100,
    backgroundColor: "#fff",
    zIndex: 2,
  },
  suggestionItem: {
    padding: 10,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  suggestionText: {
    fontSize: 16,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    margin: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
