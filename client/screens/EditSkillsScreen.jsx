import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../assets/constants";

export default function EditSkills({ route }) {
  const navigation = useNavigation();
  const { skills = [], type, skillsToTeach = [], skillsToLearn = [] } = route.params;

  const skillCategories = {
    Languages: ["English", "Arabic", "Spanish", "Hebrew"],
    Programming: ["JavaScript", "Python", "HTML", "CSS", "React", "Node.js", "Firebase", "Flutter"],
    Design: ["Photoshop", "Figma", "Canva", "Illustrator"],
    Music: ["Piano", "Guitar", "Drums", "Oud"],
  };

  const [selectedSkills, setSelectedSkills] = useState(
    skills.map(skill => typeof skill === "string" ? skill : skill.name)
  );

  // Get a flat list of skills that should be excluded
  const excludeList = type === "teach"
    ? skillsToLearn.map(s => (typeof s === "string" ? s : s.name))
    : skillsToTeach.map(s => (typeof s === "string" ? s : s.name));

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

const handleSave = async () => {
  try {
    const currentUser = FirebaseAuth.currentUser;
    const userRef = doc(FirestoreDB, "users", currentUser.uid);

    let skillsToSave;

    if (type === "teach") {
      // Map selected skills and retain previous verification status
      const previousSkills = skills.filter(skill => typeof skill === 'object');
      skillsToSave = selectedSkills.map((skill) => {
        const wasVerified = previousSkills.find((s) => s.name === skill)?.verified;
        return { name: skill, verified: wasVerified ?? false };
      });
    } else {
      // Save as plain strings for 'skillsToLearn'
      skillsToSave = selectedSkills;
    }

    await updateDoc(userRef, {
      [type === "teach" ? "skillsToTeach" : "skillsToLearn"]: skillsToSave,
    });

    Alert.alert("✅ Success", "Skills updated successfully!");
navigation.navigate("ProfileScreen", { refreshSkills: true });
  } catch (err) {
    console.error("Failed to update skills:", err);
    Alert.alert("❌ Error", "Failed to update skills. Please try again.");
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
      <LinearGradient colors={["#6a11cb", "#2575fc"]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Edit {type === "teach" ? "Skills to Teach" : "Skills to Learn"}
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Select Your Skills</Text>

        {Object.entries(skillCategories).map(([category, skills]) => {
          const filteredSkills = skills.filter(skill => !excludeList.includes(skill));
          if (filteredSkills.length === 0) return null;

          return (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.skillWrap}>
                {filteredSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      onPress={() => toggleSkill(skill)}
                      style={[
                        styles.chip,
                        { backgroundColor: isSelected ? colors.teal : "#e0f7fa" },
                      ]}
                    >
                      <Text style={{ color: isSelected ? "#fff" : colors.primary }}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
  },
  categoryBlock: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#6a11cb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    marginBottom: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
