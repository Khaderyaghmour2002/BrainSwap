import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const LANGUAGES = [
  { id: "1", title: "English", imageSource: require("../assets/flags/america.png") },
  { id: "2", title: "Swedish", imageSource: require("../assets/flags/sweden.png") },
  { id: "3", title: "Japanese", imageSource: require("../assets/flags/japan.png") },
  { id: "4", title: "German", imageSource: require("../assets/flags/germany.png") },
  { id: "5", title: "Italian", imageSource: require("../assets/flags/italy.png") },
  { id: "6", title: "Hebrew", imageSource: require("../assets/flags/israel.png") },
  { id: "7", title: "Arabic", imageSource: require("../assets/flags/saudi.png") },
];

export default function LanguagePickerScreen({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleSave = async () => {
    if (!selectedLanguage) {
      Alert.alert("No Language Selected", "Please select a language.");
      return;
    }

    try {
      const currentUser = FirebaseAuth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }

      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);

      // Save the selected language to Firestore
      await updateDoc(userDocRef, {
        language: selectedLanguage.title, // Save the language title
      });

      Alert.alert("Language Saved", `You selected ${selectedLanguage.title}`);
      navigation.navigate("ProfileMakerScreen"); // Navigate to ProfileMakerScreen after saving
    } catch (error) {
      console.error("Error saving language:", error);
      Alert.alert("Error", "Failed to save language. Please try again.");
    }
  };

  const renderLanguageItem = ({ item }) => {
    const isSelected = selectedLanguage?.id === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
        ]}
        onPress={() => handleLanguageSelect(item)}
      >
        <Image source={item.imageSource} style={styles.languageImage} />
        <Text style={styles.languageText}>{item.title}</Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Language</Text>
      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity
        style={[styles.saveButton, !selectedLanguage && styles.disabledButton]}
        onPress={handleSave}
        disabled={!selectedLanguage}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    marginTop: 40,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },
  languageItemSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  languageImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  languageText: {
    flex: 1,
    fontSize: 18,
    color: "#333",
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});
