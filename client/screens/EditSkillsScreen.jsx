import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function EditSkills({ route, navigation }) {
  const { skills, type } = route.params; // type is either 'teach' or 'learn'
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

      Alert.alert("Success", "Skills updated!");
      navigation.goBack();
    } catch (err) {
      console.error("Failed to update skills:", err);
      Alert.alert("Error", "Could not update skills.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter comma-separated skills:</Text>
      <TextInput
        style={styles.input}
        value={skillsText}
        onChangeText={setSkillsText}
        placeholder="e.g. Python, Teaching, Guitar"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Skills</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6a11cb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
