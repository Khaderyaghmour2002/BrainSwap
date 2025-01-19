import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function PhotoUploadScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImageFromLibrary = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to grant permission to access your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "You need to grant permission to access your camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const choosePhotoOption = () => {
    Alert.alert(
      "Upload Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhotoWithCamera },
        { text: "Choose from Gallery", onPress: pickImageFromLibrary },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const savePhoto = async () => {
    if (!selectedImage) {
      Alert.alert("No Photo Selected", "Please select a photo before saving.");
      return;
    }

    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in.");
        return;
      }

      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
      await updateDoc(userDocRef, { photoUrl: selectedImage });

      Alert.alert("Success", "Photo uploaded successfully!");
      navigation.replace("WelcomeScreen");
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Photo</Text>
      <Text style={styles.subtitle}>
        On our platform, everyone has a profile photo that clearly shows their
        face.
      </Text>
      <TouchableOpacity style={styles.imagePicker} onPress={choosePhotoOption}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="add-outline" size={40} color="#6a11cb" />
            <Text style={styles.imagePickerText}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedImage && { backgroundColor: "#ccc" },
        ]}
        onPress={savePhoto}
        disabled={!selectedImage}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 35,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop:15,
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  uploadPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerText: {
    fontSize: 14,
    color: "#6a11cb",
    marginTop: 10,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  continueButton: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#4caf50",
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
