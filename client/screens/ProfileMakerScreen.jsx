import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FirebaseAuth, FirestoreDB } from "../../server/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function SkillsToTeachScreen({ navigation , route}) {
    const skillsToTeach = route?.params?.skillsToTeach || [];

  const skillCategories = {
    Languages: ["English", "Arabic", "Spanish", "Hebrew"],
    Programming: ["JavaScript", "Python", "HTML", "CSS", "React", "Node.js", "Firebase", "Flutter"],
    Design: ["Photoshop", "Figma", "Canva", "Illustrator"],
    Music: ["Piano", "Guitar", "Drums", "Oud"],
  };

  const flatSkillList = Object.values(skillCategories).flat().sort();
  const [searchText, setSearchText] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const maxSkills = 5;

  const scaleAnimations = useMemo(() => {
    return flatSkillList.reduce((map, skill) => {
      map[skill] = new Animated.Value(1);
      return map;
    }, {});
  }, []);

  const filteredSkills = useMemo(() => {
    if (!searchText.trim()) return skillCategories;
    const lower = searchText.toLowerCase();
    const filtered = {};

    for (let [category, skills] of Object.entries(skillCategories)) {
      const match = skills.filter((s) => s.toLowerCase().includes(lower));
      if (match.length > 0) filtered[category] = match;
    }

    return filtered;
  }, [searchText]);

  const toggleSkill = (skill) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[skill], {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[skill], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedSkills((prev) => {
      if (prev.includes(skill)) return prev.filter((s) => s !== skill);
      if (prev.length >= maxSkills) {
        Alert.alert("Limit Reached", `You can choose up to ${maxSkills} skills.`);
        return prev;
      }
      return [...prev, skill];
    });
  };

  const onNextPressed = async () => {
    try {
      const currentUser = FirebaseAuth.currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user is logged in!");
        return;
      }

      const skillsWithVerification = selectedSkills.map(skill => ({
        name: skill,
        verified: false, // <-- Verification flag
      }));

      const userDocRef = doc(FirestoreDB, "users", currentUser.uid);
      await setDoc(userDocRef, { skillsToTeach: skillsWithVerification }, { merge: true });
navigation.replace("ProfileMakerScreen1", { skillsToTeach: selectedSkills });
    } catch (error) {
      console.error("Error saving skills to Firestore:", error);
      Alert.alert("Error", "Unable to save skills. Please try again.");
    }
  };

  return (
    <LinearGradient colors={["#eef2f3", "#8e9eab"]} style={styles.gradientContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>What skills can you teach?</Text>
        <Text style={styles.subtitle}>Select up to {maxSkills} skills</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search skills..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollableList}>
        {Object.entries(filteredSkills).map(([category, skills]) => (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.skillWrap}>
              {skills.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                const animatedStyle = { transform: [{ scale: scaleAnimations[skill] }] };

                return (
                  <Animated.View key={skill} style={animatedStyle}>
                    <TouchableOpacity
                      style={[styles.skillBlock, isSelected && styles.selectedSkillBlock]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={[styles.skillText, isSelected && styles.selectedSkillText]}>
                        {skill}
                      </Text>
                      {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.counterText}>
        Selected: {selectedSkills.length} / {maxSkills}
      </Text>

      <Text style={styles.verificationNote}>
        You will be asked to verify your skills later.
      </Text>

      <Pressable
        style={[
          styles.nextButton,
          selectedSkills.length === 0 && { opacity: 0.4 },
        ]}
        disabled={selectedSkills.length === 0}
        onPress={onNextPressed}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "700", color: "#2b3a67", marginBottom: 6 },
  subtitle: { fontSize: 15, color: "#6e7d9b", marginBottom: 12 },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    width: "100%",
    fontSize: 14,
    shadowColor: "#aaa",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  scrollableList: { paddingBottom: 20 },
  categoryBlock: { marginBottom: 24 },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#444",
    marginBottom: 8,
    marginLeft: 6,
  },
  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  skillBlock: {
    backgroundColor: "#ffffffcc",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#aaa",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  selectedSkillBlock: {
    backgroundColor: "#4caf50",
    borderColor: "#4caf50",
    elevation: 4,
  },
  skillText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  selectedSkillText: {
    color: "#fff",
    fontWeight: "700",
  },
  selectedCheck: {
    position: "absolute",
    right: 8,
    top: 6,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  counterText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
  },
  verificationNote: {
    textAlign: "center",
    fontSize: 13,
    color: "#888",
    marginBottom: 12,
    fontStyle: "italic",
  },
  nextButton: {
    backgroundColor: "#4caf50",
    marginHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 24,
    elevation: 3,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
