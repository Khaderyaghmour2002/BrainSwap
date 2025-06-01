import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

export default function EditSkills({ route }) {
  const navigation = useNavigation();
  const { skills, type } = route.params;
  const [skillsText, setSkillsText] = useState(skills?.join(", ") || "");

  const handleSave = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      const userRef = doc(FirestoreDB, "users", currentUser.uid);

      const updatedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await updateDoc(userRef, {
        [type === "teach" ? "skillsToTeach" : "skillsToLearn"]: updatedSkills,
      });

      Alert.alert("Success", "Skills updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("Failed to update skills:", err);
      Alert.alert("Error", "Failed to update skills. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      {/* Header */}
      <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit {type === "teach" ? "Skills to Teach" : "Skills to Learn"}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.label}>Enter your skills, separated by commas</Text>
        <TextInput
          style={styles.input}
          value={skillsText}
          onChangeText={setSkillsText}
          placeholder="e.g. Python, Cooking, Piano"
          placeholderTextColor="#aaa"
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6a11cb",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 100,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#6a11cb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
