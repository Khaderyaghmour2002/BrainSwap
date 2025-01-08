import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FirebaseAuth, FirestoreDB } from "../../firebaseConfig"; // Import FirestoreDB
//import { doc, setDoc } from "firebase/firestore"; // Firestore imports
import { doc, updateDoc } from "firebase/firestore";

export default function PhotoUploadScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to grant permission to access your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); // For Expo ImagePicker
    }
  };

  const savePhoto = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }

      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
      await updateDoc(userDocRef, { photoUrl: selectedImage });

      Alert.alert("Success", "Photo uploaded successfully!");
      navigation.replace("HomeScreen"); // Navigate to Home after saving the photo
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a Profile Photo</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Tap to select a photo</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={savePhoto}>
        <Text style={styles.saveButtonText}>Save Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  imagePickerText: {
    fontSize: 14,
    color: "#666",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#4caf50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
