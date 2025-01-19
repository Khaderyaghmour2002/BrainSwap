import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function WriteBioScreen({ navigation }) {
  const [bio, setBio] = useState("");

  const saveBio = async () => {
    if (bio.trim() === "") {
      alert("Bio cannot be empty.");
      return;
    }

    try {
      const currentUser = FirebaseAuth.currentUser;

      if (!currentUser) {
        alert("No user is logged in.");
        return;
      }

      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);

      // Update the bio in Firestore
      await updateDoc(userDocRef, {
        bio: bio.trim(),
      });

      alert("Bio saved successfully!");
      navigation.navigate("HomeScreen"); // Navigate to the home screen or the next screen
    } catch (error) {
      console.error("Error saving bio:", error);
      alert("Failed to save bio. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>
          This will help others understand you better. Share your skills,
          interests, or a fun fact about yourself.
        </Text>

        <TextInput
          style={styles.bioInput}
          multiline
          numberOfLines={6}
          placeholder="Write something about yourself..."
          placeholderTextColor="#999"
          value={bio}
          onChangeText={(text) => setBio(text)}
          maxLength={250}
        />
        <Text style={styles.characterCount}>{bio.length}/250</Text>

        <TouchableOpacity
          style={[styles.saveButton, bio.trim() === "" && styles.disabledButton]}
          onPress={saveBio}
          disabled={bio.trim() === ""}
        >
          <Text style={styles.saveButtonText}>SAVE</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F9F9F9",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  bioInput: {
    width: "100%",
    height: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlignVertical: "top", // For Android to align text at the top
  },
  characterCount: {
    alignSelf: "flex-end",
    marginTop: 5,
    marginRight: 10,
    fontSize: 12,
    color: "#999",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#00BFFF",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: "center",
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
